import { Svg } from '@cast/shared-components';
import NavButton from './NavButton';

const PossitionWrapper = ({
  isTopPossition,
  previewButton,
  backButton,
  submitOrNext,
  isSubmit,
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
        <div className="columns is-mobile flex-1 is-align-items-center">
          <div className={`column ${isSubmit ? 'is-4' : 'is-6'}`}>
            {backButton}
          </div>
          <div className={`column ${isSubmit ? 'is-8' : 'is-6'}`}>
            {submitOrNext}
          </div>
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
  previewMode,
  onSubmit,
  isSubmitting,
  isPreviewModeVisible,
  position,
}) {
  const isTopPossition = position === 'top';

  const isNextButton = showSubmitOrNext === 'next';

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
            isSubmit={showSubmitOrNext === 'submit'}
            isTopPossition={isTopPossition}
            previewButton={
              isPreviewModeVisible && (
                <NavButton
                  disabled={isSubmitting}
                  onClick={onClickPreview}
                  classNames="vote-button transition-all mr-3"
                  text={
                    previewMode ? (
                      <div className="is-flex is-align-items-center">
                        <span className="mr-3">Close Preview</span>
                        <Svg name="Close" width="14" height="14" />
                      </div>
                    ) : (
                      'Preview'
                    )
                  }
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
              <NavButton
                formId={formId}
                disabled={!isStepValid || isSubmitting}
                classNames={`vote-button has-background-yellow ${
                  !isTopPossition ? 'is-fullwidth' : ''
                }`}
                onClick={isNextButton ? onClickNext : onSubmit}
                text={isNextButton ? 'Next' : finalLabel}
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
