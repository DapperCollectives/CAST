import ChoiceOptionCreator from './ChoiceOptionCreator';
import RankedVoteExample from './RankedVoteExample';
import SingleVoteExample from './SingleVoteExample';

export default function VotingSelector({
  voteType,
  setValue,
  register,
  clearErrors,
  control,
  errors,
}) {
  return (
    <>
      <div className="border-light-tablet rounded-lg columns is-flex-direction-column is-mobile m-0 p-6 p-0-mobile mb-6">
        <h4 className="title is-5 mb-2">Type of Voting</h4>
        <p className="has-text-grey mb-5">
          Select the type of voting you would like to use for this proposal. To
          learn more about these options,{' '}
          <a
            target="_blank"
            rel="noreferrer noopener"
            href="https://docs.cast.fyi"
            className="is-underlined has-text-grey"
          >
            check out our FAQ
          </a>
          .
        </p>
        <div>
          <div
            className={`border-light rounded-sm is-flex is-align-items-center m-0 p-0 mb-4 cursor-pointer ${
              voteType === 'single-choice' ? 'border-grey' : 'border-light'
            }`}
            // TODO FIX THIS
            // onClick={() => setValue('voteType', 'single-choice')}
          >
            <div className="p-4">
              <div className="is-flex is-align-items-center mr-2">
                <div className="is-flex is-align-items-center mr-2">
                  <label className="radio is-flex">
                    <input
                      {...register('voteType')}
                      type="radio"
                      value="single-choice"
                      className="green-radio"
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="py-5 pr-5">
              <h5 className="title is-6 mb-2">Single Choice Voting</h5>
              <p>
                Voters can only vote on one option and all options are
                customized by proposal creator.
              </p>
            </div>
            <div className="has-background-light-grey p-4 is-hidden-mobile rounded-sm-br rounded-sm-tr is-flex is-flex-direction-column is-align-self-stretch is-justify-content-center ">
              <SingleVoteExample />
            </div>
          </div>
          <div
            className={`border-light rounded-sm is-flex is-align-items-center m-0 p-0 cursor-pointer ${
              voteType === 'ranked-choice' ? 'border-grey' : 'border-light'
            }`}
            // onClick={() => setValue('voteType', 'ranked-choice')}
          >
            <div className="p-4">
              <div className="is-flex is-align-items-center mr-2">
                <label className="radio is-flex">
                  <input
                    {...register('voteType')}
                    type="radio"
                    value="ranked-choice"
                    className="green-radio"
                  />
                </label>
              </div>
            </div>
            <div className="py-5 pr-5">
              <h5 className="title is-6 mb-2">Ranked Voting</h5>
              <p>
                Voters may select and rank any number of choices. Choices are
                randomized by default.
              </p>
            </div>
            <div className="has-background-light-grey p-4 is-hidden-mobile rounded-sm-br rounded-sm-tr is-flex is-flex-direction-column is-align-self-stretch is-justify-content-center">
              <RankedVoteExample />
            </div>
          </div>
        </div>
      </div>
      <div className="border-light-tablet rounded-lg columns is-flex-direction-column is-mobile m-0 p-6 p-0-mobile mb-6">
        <h4 className="title is-5 mb-2">
          Choices <span className="has-text-danger">*</span>
        </h4>
        {voteType === 'single-choice' ? (
          <p className="has-text-grey mb-4">
            Provide the specific options you’d like to cast votes for. Use
            Text-based presentation for choices that are described in words. Use
            Visual for side-by-side visual options represented by images.
          </p>
        ) : (
          <p className="has-text-grey mb-4">
            Provide the specific options you’d like to cast votes for. Ranked
            Choice Voting currently only supports Text-based presentation for
            choices that are described in words.
          </p>
        )}
        <ChoiceOptionCreator
          setValue={setValue}
          error={errors['choices']}
          fieldName="choices"
          register={register}
          control={control}
          clearErrors={clearErrors}
          voteType={voteType}
        />
      </div>
    </>
  );
}
