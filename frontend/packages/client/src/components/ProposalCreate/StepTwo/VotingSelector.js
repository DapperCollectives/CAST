import { Card } from 'components/Card';
import { Box, Heading } from '@chakra-ui/react';
import { Text } from '@chakra-ui/react';
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
        <Heading as="h4" fontSize="2xl" mb={2}>
          Type of Voting
        </Heading>
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

        <Box
          sx={{
            '.border-grey': {
              borderColor: 'var(--chakra-colors-grey-400)',
            },
          }}
        >
          <Card
            variant="votingType"
            mb={4}
            onClick={() => setValue('voteType', 'single-choice')}
            className={voteType === 'single-choice' ? 'border-grey' : ''}
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
          </Card>
          <Card
            variant="votingType"
            mb={4}
            onClick={() => setValue('voteType', 'ranked-choice')}
            className={voteType === 'ranked-choice' ? 'border-grey' : ''}
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
          </Card>
        </Box>
      </div>
      <div className="border-light-tablet rounded-lg columns is-flex-direction-column is-mobile m-0 p-6 p-0-mobile mb-6">
        <Heading as="h4" fontSize="2xl" mb={2}>
          Choices <span className="has-text-danger">*</span>
        </Heading>
        {voteType === 'single-choice' ? (
          <Text color={'grey.500'} mb={4}>
            Provide the specific options you’d like to cast votes for. Use
            Text-based presentation for choices that are described in words. Use
            Visual for side-by-side visual options represented by images.
          </Text>
        ) : (
          <>
            <Text color={'grey.500'} mb={4}>
              Provide the specific options you’d like to cast votes for. Ranked
              Choice Voting currently only supports Text-based presentation for
              choices that are described in words.
            </Text>
            <Text color={'grey.500'} mb={4} fontWeight="bold" fontSize="sm">
              All choices will be randomized for voters
            </Text>
          </>
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
