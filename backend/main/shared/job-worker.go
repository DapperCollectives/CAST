package shared

import (
	"context"
	"encoding/json"
	"os"
	"time"

	"github.com/hibiken/asynq"
	"github.com/rs/zerolog/log"
)

var redisAddr = os.Getenv("REDIS_URL")

/************************************************************/
/*						Types								*/
/************************************************************/

/* Template IDs */
const (
	ProposalActiveTemplateID = "6629307769225216"
)

/* Task Types */
const (
	TypeProposalEmail = "email:proposal-active"
)

type EmailTaskPayload struct {
	CommunityId       int
	CommunityName     string
	CommunityImageUrl string
	ProposalId        int
	ProposalTitle     string
	ProposalUrl       string
	EndTime           string
}

/************************************************************/
/*						Server								*/
/************************************************************/

func StartJobWorkers() *asynq.Server {
	srv := asynq.NewServer(
		asynq.RedisClientOpt{Addr: redisAddr},
		asynq.Config{
			Concurrency: 10,
			Queues: map[string]int{
				"notification": 7,
				"default":      3,
			},
		},
	)

	mux := asynq.NewServeMux()
	mux.HandleFunc(TypeProposalEmail, runSendProposalEmailTask)

	if err := srv.Run(mux); err != nil {
		log.Err(err)
	}
	return srv
}

func runSendProposalEmailTask(ctx context.Context, t *asynq.Task) error {
	var p EmailTaskPayload
	if err := json.Unmarshal(t.Payload(), &p); err != nil {
		return err
	}
	log.Printf(" [*] Sending Proposal Active Email for Proposal %d", p.ProposalId)
	sendProposalEmails(p)
	return nil
}

func NewProposalEmailTask(cId int, cName string, cImageUrl string, pId int, pTitle string, pUrl string, end string) (*asynq.Task, error) {
	payload, err := json.Marshal(
		EmailTaskPayload{
			CommunityId:       cId,
			CommunityName:     cName,
			CommunityImageUrl: cImageUrl,
			ProposalId:        pId,
			ProposalTitle:     pTitle,
			ProposalUrl:       pUrl,
			EndTime:           end,
		},
	)
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypeProposalEmail, payload), nil
}

/************************************************************/
/*						Client								*/
/************************************************************/

func getWorkerInspector() *asynq.Inspector {
	var i *asynq.Inspector
	if i == nil {
		i = asynq.NewInspector(asynq.RedisClientOpt{Addr: redisAddr})
	}

	return i
}

func getWorkerClient() *asynq.Client {
	var c *asynq.Client
	if c == nil {
		c = asynq.NewClient(asynq.RedisClientOpt{Addr: redisAddr})
		//defer c.Close()
	}

	return c
}

func ArchiveTask(id string) error {
	i := getWorkerInspector()
	err := i.ArchiveTask("notification", id)
	return err
}

func EnqueueProposalEmailTask(p EmailTaskPayload, start time.Time) *asynq.TaskInfo {
	c := getWorkerClient()
	task, err := NewProposalEmailTask(p.CommunityId, p.CommunityName, p.CommunityImageUrl, p.ProposalId, p.ProposalTitle, p.ProposalUrl, p.EndTime)
	if err != nil {
		log.Error().Err(err).Msgf("could not create task: %v", err)
	}

	info, err := c.Enqueue(task, asynq.Queue("notification"), asynq.ProcessAt(start))
	if err != nil {
		log.Error().Err(err).Msgf("could not enqueue task: %v", task)
	}
	log.Printf("enqueued task: id=%s queue=%s", info.ID, info.Queue)
	return info
}
