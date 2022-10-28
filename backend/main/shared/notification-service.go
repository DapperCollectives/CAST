package shared

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/rs/zerolog/log"
)

type LeanplumBatchBody struct {
	AppId      string              `json:"appId"`
	ClientKey  string              `json:"clientKey"`
	ApiVersion string              `json:"apiVersion"`
	Time       int64               `json:"time"`
	Data       []LeanplumBatchData `json:"data"`
}

type LeanplumBatchData struct {
	Action    string              `json:"action"`
	Time      int64               `json:"time"`
	UserId    string              `json:"userId"`
	MessageId string              `json:"messageId"`
	Values    LeanplumEmailValues `json:"values"`
}

type LeanplumEmailValues struct {
	CommunityName     string `json:"CommunityName"`
	ProposalTitle     string `json:"ProposalTitle"`
	CommunityImageUrl string `json:"CommunityImageUrl"`
	EndTime           string `json:"EndTime"`
	ProposalUrl       string `json:"ProposalUrl"`
}

func sendProposalEmails(p EmailTaskPayload) {
	var fileResponse map[string]interface{}
	jobId := getExportJobId(p.CommunityId)
	for {
		fileResponse = getExportFiles(jobId)
		if fileResponse["state"] == "RUNNING" {
			time.Sleep(5 * time.Second)
		} else {
			log.Info().Msgf("LP Export Job Complete with Response: %+v", fileResponse)
			break
		}
	}
	fileArr := fileResponse["files"].([]interface{})
	file := fileArr[0].(string)
	rows := getExportCSV(file)
	sendBatchMessage(rows, p)
}

func sendBatchMessage(rows []string, p EmailTaskPayload) {
	var users []LeanplumBatchData
	values := &LeanplumEmailValues{
		CommunityName:     p.CommunityName,
		ProposalTitle:     p.ProposalTitle,
		CommunityImageUrl: p.CommunityImageUrl,
		EndTime:           p.EndTime,
		ProposalUrl:       p.ProposalUrl,
	}

	for _, line := range rows {
		if line != "" {
			s := strings.Split(line, ",")
			if s[1] == "False" {
				continue
			}
			users = append(users, LeanplumBatchData{
				Action:    "sendMessage",
				Time:      time.Now().Unix(),
				UserId:    s[0],
				MessageId: ProposalActiveTemplateID,
				Values:    *values,
			})
		}
	}

	body := LeanplumBatchBody{
		AppId:      os.Getenv("LEANPLUM_APP_ID"),
		ClientKey:  os.Getenv("LEANPLUM_CLIENT_KEY"),
		ApiVersion: "1.0.6",
		Time:       time.Now().Unix(),
		Data:       users,
	}
	j, _ := json.Marshal(body)

	req, err := http.NewRequest("POST", "https://api.leanplum.com/api?action=multi", bytes.NewBuffer(j))
	if err != nil {
		log.Error().Err(err)
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Error().Err(err)
	}
	defer resp.Body.Close()

	r, _ := ioutil.ReadAll(resp.Body)
	log.Info().Msgf("Proposal Active Batch Emails Sent For Proposal ID %d", p.ProposalId)
	log.Info().Msgf("Response body from Leanplum: %+v", string(r))
}

func getExportCSV(url string) []string {
	resp, err := http.Get(url)
	if err != nil {
		log.Error().Err(err)
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)
	bodyString := strings.TrimRight(string(body), "\n")
	rows := strings.Split(bodyString, "\n")
	return rows
}

func getExportFiles(jobId string) map[string]interface{} {
	url := fmt.Sprintf("https://api.leanplum.com/api?appId=%s&clientKey=%s&apiVersion=1.0.6&jobId=%s&action=getExportResults", os.Getenv("LEANPLUM_APP_ID"), os.Getenv("LEANPLUM_EXPORT_KEY"), jobId)

	req, _ := http.NewRequest("GET", url, nil)
	q := req.URL.Query()
	req.URL.RawQuery = q.Encode()

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Error().Err(err)
	}
	defer resp.Body.Close()

	// check resp.Status

	body, _ := ioutil.ReadAll(resp.Body)
	var jsonMap map[string]interface{}
	json.Unmarshal([]byte(string(body)), &jsonMap)

	response := jsonMap["response"].([]interface{})
	values := response[0].(map[string]interface{})
	return values
}

func getExportJobId(communityId int) string {
	url := fmt.Sprintf("https://api.leanplum.com/api?appId=%s&clientKey=%s&apiVersion=1.0.6&action=exportUsers", os.Getenv("LEANPLUM_APP_ID"), os.Getenv("LEANPLUM_EXPORT_KEY"))

	req, _ := http.NewRequest("GET", url, nil)
	attribute := "community" + strconv.Itoa(communityId)
	q := req.URL.Query()
	q.Add("userAttribute", attribute)
	req.URL.RawQuery = q.Encode()

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Error().Err(err)
	}
	defer resp.Body.Close()

	// check resp.Status

	body, _ := ioutil.ReadAll(resp.Body)
	var jsonMap map[string]interface{}
	json.Unmarshal([]byte(string(body)), &jsonMap)

	response := jsonMap["response"].([]interface{})
	values := response[0].(map[string]interface{})
	return values["jobId"].(string)
}
