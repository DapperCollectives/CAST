export const HELLO_WORLD = `
    import HelloWorld from 0x01

    transaction {

    prepare(acct: AuthAccount) {}

    execute {
        log(HelloWorld.hello())
    }
    }
`;
