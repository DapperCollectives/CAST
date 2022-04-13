### Endpoints fields

This file is used to specify the missing fields in endpoints.

#### GET [/communities]() <br/>``

#### Fields

| Name           |   Required   |  Type   |                     Description                      | Status          |
| -------------- | :----------: | :-----: | :--------------------------------------------------: | --------------- |
| `isComingSoon` | not required | boolean | based on designs if community will be available soon | Not implemented |
| `isMember`     |   required   | boolean |     Indicates if user is member of the community     | Not implemented |

#### GET [/communities/:communityId](#) `<br/>`

#### Fields

| Name                  | Required  |  Type   |      Description      | Status          |
| --------------------- | :-------: | :-----: | :-------------------: | --------------- |
| `aboutText`           | required? | string  |  Describes community  | Not implemented |
| `network`             | required? | string  | goes in the about tab | Not implemented |
| `proposal-validation` | required? | string? | goes in the about tab | Not implemented |
| `proposal-threshold`  | required? | string? | goes in the about tab | Not implemented |
| `strategies`          | required? | string? | goes in the about tab | Not implemented |
| `plugin`              | required? | string? | goes in the about tab | Not implemented |
| `admins`              | required? | array?  |    array of admins    | Not implemented |
| `authors`             | required? | array?  |       array of        | Not implemented |

#### GET [/communities/:comminityId/proposals](#) `<br/>`

Notes:

#### Fields

| Name           | Required  |  Type   |          Description           | Status          |
| -------------- | :-------: | :-----: | :----------------------------: | --------------- |
| `voted`        | required  | boolean | indicates if user voted or not | Not implemented |
| `textDecision` | required  | string  |   decision made after voting   | Not implemented |
| `winCount`     | required? |   int   |                                | Not implemented |

#### GET [/proposals/:proposalId](#) `<br/>`

#### Comparison current fields and mocked fields

| Backend        |  Type  |    FrontEnd    |      Type       |                                                  Status                                                   |
| -------------- | :----: | :------------: | :-------------: | :-------------------------------------------------------------------------------------------------------: |
| `block_height` |  int   |    no used     |        -        |                                                     -                                                     |
| `choices`      | Array  |    choices     | array of string |                                        Updated: using string array                                        |
| `communityId`  |  int   |  communityId   |       int       |                                                    👍                                                     |
| `created_at`   |  Date  |       -        |        -        |                                                 not used                                                  |
| `creatorAddr`  | string | `creatorAddr`  |     string      |                                                    👍                                                     |
| `description`  | string | `description`  |     string      |                                            currently not used                                             |
| `endTime`      |  Date  |   `endTime`    |      Date       |                                                    👍                                                     |
| `id`           |  int   | `comminityId`  |       int       |                                                    👍                                                     |
| `name`         | string |     `name`     |     string      |                                                    👍                                                     |
| `startTime`    |  Date  |  `startTime`   |      Date       |                                                    👍                                                     |
| -              |   -    |    `isCore`    |     boolean     |                                          updated: hidden for now                                          |
| `body`         |   -    |     `body`     |  string - html  |                                                  updated                                                  |
| -              |   -    |   `strategy`   |     string      | needs update: not returning from backend => it's populataed trhoug an endopont what do. waiting on result |
| -              |   -    |   `ipfsUrl`    |     string      |                                     updated: using cid to create url                                      |
| `cid`          |   -    |     `ipfs`     |     string      |                                    updated: using cid instead of ipfs                                     |
| -              |   -    | `votingSystem` |     string      |                                   updated: not going to be used for now                                   |
| -              |   -    |     `cast`     |     string      |                                   updated: not going to be used for now                                   |
| -              |   -    |   `castUrl`    |     string      |                                   updated: not going to be used for now                                   |
| -              |   -    |  `totalVotes`  |       int       |                                            going to be updated                                            |
| -              |   -    |    `votes`     |     obejct      |                                will use another endpoing to get this data                                 |
| -              |   -    |   `results`    |     obejct      |                                will use another endpoing to get this data                                 |
| -              |   -    |  `strategies`  |     obejct      |                                will use another endpoing to get this data                                 |
| -              |   -    |   `winCount`   |       int       |                                will use another endpoing to get this data                                 |

#### POST [/communities/1/proposals]() <br/>``

#### Fields

| Name          | Required |  Type  |                  Description                  | Status      |
| ------------- | :------: | :----: | :-------------------------------------------: | ----------- |
| `name`        | required | string |               Title of proposal               | implemented |
| `description` | required | string |        uneccsary field, removing soon         | hardcoded   |
| `body`        | required | string |         HTML body content of proposal         | implemented |
| `choices`     | required | array  | array of string to represent proposal options | implemented |
| `creatorAddr` | required | string |    flow wallet address of proposal creator    | implemented |
| `startTime`   | required | string |  ISO format datetime of when proposal starts  | implemented |
| `endTime`     | required | string |   ISO format datetime of when proposal ends   | implemented |

#### POST [/proposals/1/votes]() <br/>``

#### Fields

| Name      | Required |  Type  |                           Description                            | Status      |
| --------- | :------: | :----: | :--------------------------------------------------------------: | ----------- |
| `choice`  | required | string |                           vote choice                            | implemented |
| `addr`    | required | string |              flow wallet address of proposal voter               | implemented |
| `sig`     | required | string |              signature of signed message from addr               | implemented |
| `message` | required | string | message signed by addr, in format of proposalId:choice:timeStamp | implemented |
