import { ActionButton } from 'components';
import NextButton from './NextStepButton';

export default function HeaderStepByStep({
  onClickBack,
  onClickPreview = () => {},
  showNextButton,
  onClickNext,
  showSubmitButton,
  formId,
  finalLabel,
  showPreStep,
  onSubmit,
  isStepValid,
}) {
  return (
    <div
      className="is-flex flex-1 has-background-white"
      style={{ position: 'fixed', width: '100%', zIndex: 2 }}
    >
      <div className="is-flex flex-1 px-6-desktop px-5-tablet px-4-mobile divider">
        <div className="container header-spacing">
          <nav className="navbar is-transparent">
            <div className="is-flex flex-0 is-align-items-center">
              <ActionButton
                height="40"
                type="submit"
                label="Preview"
                enabled={true}
                loading={false}
                roundedClass="rounded-xl"
                classNames="vote-button transition-all is-size-6 has-text-weight-bold mr-3"
                styles={{ width: 94 }}
              />
            </div>
            <div className="navbar-end">
              <ActionButton
                height="40"
                onClick={onClickBack}
                type="submit"
                label="Back"
                enabled={true}
                loading={false}
                roundedClass="rounded-xl"
                classNames="vote-button transition-all is-size-6 has-text-weight-bold mr-3"
                styles={{ width: 94 }}
              />
              <NextButton
                formId={formId}
                moveToNextStep={showNextButton}
                disabled={!isStepValid}
              />
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
