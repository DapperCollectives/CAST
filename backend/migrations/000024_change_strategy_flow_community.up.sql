UPDATE communities SET
    twitter_url = 'https://twitter.com/flow_blockchain', 
    discord_url = 'https://discord.gg/flow',
    strategies = '[{"name": "token-weighted-default", "contract": {"addr": "0x0ae53cb6e3f42a79", "name": "FlowToken", "threshold": "0", "publicPath": "flowTokenBalance"}}]'
WHERE id = 1;
