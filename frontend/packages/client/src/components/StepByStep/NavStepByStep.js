import NavButton from './NavButton';

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
              {isPreviewModeVisible && (
                <NavButton
                  disabled={isSubmitting}
                  onClick={onClickPreview}
                  classNames="vote-button transition-all mr-3"
                  text="Preview"
                />
              )}
            </div>
            <div className="navbar-end">
              <NavButton
                disabled={isSubmitting || !isBackButtonEnabled}
                onClick={onClickBack}
                classNames="vote-button transition-all mr-3"
                text="Back"
              />

              {showSubmitOrNext === 'next' ? (
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
              )}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
