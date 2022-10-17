import classnames from 'classnames';
import NavButton from './NavButton';

const PossitionWrapper = ({
  isTopPossition,
  previewButton,
  backButton,
  submitOrNext,
}) => {
  return (
    <nav className="navbar is-transparent">
      {isTopPossition ? (
        <>
          <div className="is-flex flex-0 is-align-items-center">
            {previewButton}
          </div>
          <div className="navbar-end">
            {backButton}
            {submitOrNext}
          </div>
        </>
      ) : (
        <div className="is-flex flex-1 is-align-items-center">
          {backButton}
          {submitOrNext}
        </div>
      )}
    </nav>
  );
};

export default function NavStepByStep({
  isStepValid,
  onClickBack,
  isBackButtonEnabled,
  onClickNext,
  showSubmitOrNext,
  formId,
  finalLabel,
  onClickPreview = () => {},
  onSubmit,
  isSubmitting,
  isPreviewModeVisible,
  position,
}) {
  const isTopPossition = position === 'top';

  return (
    <div
      className={`is-flex flex-1 has-background-white ${
        !isTopPossition ? 'has-background-light-grey' : ''
      }`}
      style={{
        position: 'fixed',
        width: '100%',
        zIndex: 2,
        ...(!isTopPossition ? { bottom: 0 } : undefined),
      }}
    >
      <div
        className={`is-flex flex-1 px-6-desktop px-5-tablet px-4-mobile  ${
          isTopPossition ? 'divider' : 'divider-top'
        }`}
      >
        <div className="container header-spacing">
          <PossitionWrapper
            isTopPossition={isTopPossition}
            previewButton={
              isPreviewModeVisible && (
                <NavButton
                  disabled={isSubmitting}
                  onClick={onClickPreview}
                  classNames="vote-button transition-all mr-3"
                  text="Preview"
                />
              )
            }
            backButton={
              isBackButtonEnabled && (
                <NavButton
                  disabled={isSubmitting}
                  onClick={onClickBack}
                  classNames="vote-button transition-all mr-3"
                  text="Back"
                />
              )
            }
            submitOrNext={
              showSubmitOrNext === 'next' ? (
                <NavButton
                  formId={formId}
                  disabled={!isStepValid || isSubmitting}
                  classNames="vote-button transition-all has-background-yellow"
                  onClick={onClickNext}
                  text="Next"
                />
              ) : (
                <NavButton
                  formId={formId}
                  disabled={!isStepValid || isSubmitting}
                  classNames="vote-button transition-all has-background-yellow"
                  onClick={onSubmit}
                  text={finalLabel}
                />
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
