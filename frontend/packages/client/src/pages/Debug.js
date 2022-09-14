import { useState } from 'react';
import { Web3Consumer } from 'contexts/Web3';

function Debug({ web3 }) {
  const { user, injectedProvider, executeTransaction } = web3;
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState(false);

  const queryHello = async () => {
    const helloMessage = await injectedProvider.query({
      cadence: `
        import HelloWorld from 0xHelloWorld

        pub fun main(): String {
          return HelloWorld.hello()
        }
      `,
      args: () => [],
    });

    setMessage(helloMessage);
  };

  const queryProfile = async () => {
    const profile = await injectedProvider.query({
      cadence: `
        import Profile from 0xProfile
        pub fun main(address: Address): Profile.ReadOnly? {
          return Profile.read(address)
        }
      `,
      args: (arg, t) => [arg(user.addr, t.Address)],
    });

    setProfile(profile ?? {});
  };

  const createProfile = async () => {
    const cadence = `
      import Profile from 0xProfile
      transaction {
        prepare(account: AuthAccount) {
          // Only initialize the account if it hasn't already been initialized
          if (!Profile.check(account.address)) {
            // This creates and stores the profile in the user's account
            account.save(<- Profile.new(), to: Profile.privatePath)
            // This creates the public capability that lets applications read the profile's info
            account.link<&Profile.Base{Profile.Public}>(Profile.publicPath, target: Profile.privatePath)
          }
        }
      }
    `;

    await executeTransaction(cadence, null);
  };

  const updateProfile = async () => {
    const cadence = `
      import Profile from 0xProfile
      transaction(name: String, color: String, info: String) {
        prepare(account: AuthAccount) {
          account
            .borrow<&Profile.Base{Profile.Owner}>(from: Profile.privatePath)!
            .setName(name)
          account
            .borrow<&Profile.Base{Profile.Owner}>(from: Profile.privatePath)!
            .setInfo(info)
          account
            .borrow<&Profile.Base{Profile.Owner}>(from: Profile.privatePath)!
            .setColor(color)
        }
      }
    `;

    const args = (arg, t) => [
      arg(profile.name, t.String),
      arg(profile.color, t.String),
      arg(profile.info, t.String),
    ];

    await executeTransaction(cadence, args);
  };

  const UnauthenticatedState = () => {
    return (
      <div className="is-flex is-align-items-center">
        <button
          className="button is-primary is-outlined"
          onClick={injectedProvider.logIn}
        >
          Log In
        </button>
        <span className="mx-4">OR</span>
        <button
          className="button is-primary is-outlined"
          onClick={injectedProvider.signUp}
        >
          Sign Up
        </button>
      </div>
    );
  };

  return (
    <section className="section">
      <div className="container">
        <h1 className="title">
          <b>Debug Contract</b>
        </h1>
        <p className="subtitle mb-5">
          Use the components below to interact with your contract.
        </p>
        {user.loggedIn && (
          <div className="mb-5">
            <hr />
            <button
              className="button is-primary is-outlined"
              onClick={queryHello}
            >
              hello()
            </button>
            {message && <span className="ml-2 is-size-4">{message}</span>}
            <hr />
          </div>
        )}
      </div>
      <div className="container">
        {user?.loggedIn ? (
          <div className="mb-5">
            <button
              className="button is-primary is-outlined"
              onClick={createProfile}
            >
              Create Profile
            </button>
            <hr />
            <button
              className="button is-primary is-outlined"
              onClick={queryProfile}
            >
              Load Profile
            </button>
            {profile && (
              <div className="mt-4">
                <div className="field">
                  <label className="label">Address</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      defaultValue={profile.address}
                      placeholder="Address"
                      disabled
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Name</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      defaultValue={profile.name}
                      placeholder="Name"
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Favorite Color</label>
                  <div className="control">
                    <input
                      className="input"
                      type="color"
                      defaultValue={profile.color}
                      onChange={(e) =>
                        setProfile({ ...profile, color: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Bio</label>
                  <div className="control">
                    <textarea
                      className="input"
                      type="info"
                      placeholder="Your personal info"
                      defaultValue={profile.info}
                      onChange={(e) =>
                        setProfile({ ...profile, info: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    className="button is-primary is-outlined"
                    onClick={updateProfile}
                  >
                    Update Profile
                  </button>
                </div>
              </div>
            )}
            <hr />
          </div>
        ) : (
          <UnauthenticatedState />
        )}
      </div>
    </section>
  );
}

export default Web3Consumer(Debug);
