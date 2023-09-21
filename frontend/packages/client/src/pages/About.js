import { useHistory } from 'react-router-dom';
import { Svg } from '@cast/shared-components';
import { Label, ModalAboutItem } from 'components';

const AboutPage = ({ location }) => {
  const { state = {} } = location;
  const history = useHistory();
  const { modal = true } = state;
  const closeModal = () => {
    // user landed on about page: no history
    if (history.length <= 2) {
      history.push('/');
      return;
    }
    history.goBack();
  };

  return (
    <div className={modal ? 'modal is-active' : undefined}>
      <div className="modal-background" onClick={closeModal} />
      <div className="modal-card rounded-sm px-4 has-background-white">
        <header
          className="modal-card-head has-background-white rounded-lg-top pb-1"
          style={{ borderBottom: '0px' }}
        >
          <div className="columns px-5 px-3-mobile-only pt-4 flex-1 is-mobile">
            <div className="column px-2 pt-1">
              <Label
                labelText="Beta"
                classNames="has-text-weight-bold smallest-text is-uppercase mr-2"
              />
            </div>
            <div
              className={`column is-flex is-narrow has-text-right is-size-2 leading-tight cursor-pointer px-2 px-3-mobile-only pt-3`}
              onClick={closeModal}
            >
              <Svg name="Close" />
            </div>
          </div>
        </header>
        <section
          className="modal-card-body pt-0 rounded-lg-bottom"
          style={{
            minHeight: '600px',
          }}
        >
          <div className="columns px-5 px-3-mobile-only pt-4 is-multiline">
            <div className="column is-12 pt-0 pb-1">
              <h3 className="is-size-3 has-text-weight-bold">
                Welcome to CAST
              </h3>
            </div>
            <div className="column is-12 pt-0 pb-1">
              <p className="medium-text has-text-grey">
                The future of communities is greater than the sum of likes and
                shares.
              </p>
            </div>
            <div className="column is-12 pt-0 pb-5">
              <p className="medium-text has-text-grey">
                CAST is your first step towards a new season of participation,
                engagement, ownership and value.
              </p>
            </div>
            <div className="column is-12 pt-0">
              <ModalAboutItem
                title="New to Web3 voting?"
                subTittle={
                  <>
                    <a
                      target="_blank"
                      rel="noreferrer noopener"
                      href="https://flowcast.gitbook.io/cast-docs/"
                      className="pr-1 has-text-black is-underlined"
                      onClick={closeModal}
                    >
                      Click here!
                    </a>
                    We'll help you.
                  </>
                }
              />
            </div>
            <div className="column is-12 pt-0">
              <ModalAboutItem
                title="Want to see CAST’s code?"
                subTittle={
                  <>
                    <a
                      target="_blank"
                      rel="noreferrer noopener"
                      href="https://github.com/onflow/CAST"
                      className="pr-1 has-text-black is-underlined"
                      onClick={closeModal}
                    >
                      Click here!
                    </a>
                    It’s fascinating.
                  </>
                }
              />
            </div>
            <div className="column is-12 pt-0">
              <ModalAboutItem
                title="Found a bug?"
                subTittle={
                  <>
                    <a
                      target="_blank"
                      rel="noreferrer noopener"
                      href="https://github.com/onflow/CAST/issues/new?assignees=markedconfidential&labels=bug&template=bug-report.md&title=%5BBUG%5D"
                      className="pr-1 has-text-black is-underlined"
                      onClick={closeModal}
                    >
                      Log here
                    </a>
                    or message us in #cast-beta
                    <a
                      target="_blank"
                      rel="noreferrer noopener"
                      href="https://discord.gg/6SptFxy344"
                      className="px-1 has-text-black is-underlined"
                      onClick={closeModal}
                    >
                      here!
                    </a>
                  </>
                }
              />
            </div>
            <div className="column is-12 pt-5 pb-3 small-text">
              <div className="is-flex flex-1 is-align-items-center is-justify-content-center">
                <a
                  href="#/privacy-policy"
                  className="px-4 is-underlined has-text-grey"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Privacy Policy
                </a>

                <a
                  href="#/terms-of-service"
                  className="px-4 is-underlined has-text-grey"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
