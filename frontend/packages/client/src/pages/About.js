import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Gitbook, Github } from '../components/Svg';

const AboutPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const modal = state?.modal ?? true;
  const closeModal = () => {
    navigate('../');
  };
  return (
    <div className={modal ? 'modal is-active' : undefined}>
      <div className="modal-background" onClick={closeModal} />
      <div
        className="modal-card rounded-sm px-4"
        style={{ maxHeight: 'calc(100vh - 85px)' }}
      >
        <header
          className="modal-card-head is-flex-direction-column has-background-white columns is-mobile m-0 py-2"
          style={{
            borderBottom: 'none',
          }}
        >
          <div className="column is-full has-text-right is-size-2 p-0 leading-tight">
            <span className="cursor-pointer" onClick={closeModal}>
              &times;
            </span>
          </div>
          <div className="column is-full has-text-left">
            <p className="modal-card-title">About</p>
          </div>
        </header>
        <section className="modal-card-body py-2 px-0">
          <div className="column px-4">
            <p className="has-text-grey mb-4 small-text">
              CAST is a voting tool for communities in the Flow network. It
              allows groups of builders, creators, and fans to make choices
              together — transparently and in public.{' '}
            </p>
            <p className="has-text-grey mb-4 small-text">
              This governance tool is being made available first, in its alpha
              stage, to those building on Flow. Soon, users will be able to
              create communities right here on CAST.
            </p>
          </div>
          <div className="columns is-mobile m-0 px-4">
            <div className="column is-narrow is-flex is-align-items-center">
              <a
                target="_blank"
                rel="noreferrer noopenner"
                href="https://docs.cast.fyi"
              >
                <Gitbook />
              </a>
            </div>
            <div className="column is-flex is-flex-direction-column">
              <div className="small-text">Gitbook</div>
              <div className="is-size-7 has-text-grey ">
                Learn more about CAST
              </div>
            </div>
          </div>
          <div className="columns is-mobile m-0 px-4">
            <div className="column is-narrow is-flex is-align-items-center">
              <a
                href="https://github.com/DapperCollectives/CAST"
                target="_blank"
                rel="noreferrer noopener"
              >
                <Github />
              </a>
            </div>
            <div className="column is-flex is-flex-direction-column">
              <div className="small-text">Github</div>
              <div className="is-size-7 has-text-grey">Contribute to CAST</div>
            </div>
          </div>
          <div className="divider mt-4" />
          <div className="column is-flex is-flex-direction-column px-4">
            <p className="has-text-grey mb-4 small-text">
              The source code for this dapp is made available to you under the
              terms of the [Apache 2.0
              license](https://www.apache.org/licenses/LICENSE-2.0).
            </p>
            <p className="has-text-grey mb-4 small-text">
              By using this dapp you agree to these terms and conditions. You
              also agree that that all data entered, submitted or stored in this
              instances of this dapp is publicly queryable or readable either on
              IPFS or directly on the Flow blockchain. Everything will be public
              and you should not input any information that you want to keep
              private.
            </p>
            <p className="has-text-grey mb-4 small-text">
              *Disclaimer of Warranty.* Unless required by applicable law or
              agreed to in writing, this dapp is being provided to you on an “AS
              IS” BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
              express or implied, including, without limitation, any warranties
              or conditions of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or
              FITNESS FOR A PARTICULAR PURPOSE.
            </p>
            <p className="has-text-grey mb-4 small-text">
              *Limitation of Liability*. In no event and under no legal theory,
              whether in tort (including negligence), contract, or otherwise,
              unless required by applicable law (such as deliberate and grossly
              negligent acts) or agreed to in writing, shall any open source
              contributor or any parties involved in the creation of this dapp
              be liable to you for damages, including any direct, indirect,
              special, incidental, or consequential damages of any character
              arising as a result of any use of the dapp or out of the use or
              inability to use the dapp (including but not limited to damages
              for loss of goodwill, work stoppage, computer failure or
              malfunction, or any and all other commercial damages or losses),
              even if such person has been advised of the possibility of such
              damages.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
