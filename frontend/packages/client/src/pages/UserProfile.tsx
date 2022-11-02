import Blockies from 'react-blockies';
import { Link as RouterLink } from 'react-router-dom';
import { useWebContext } from 'contexts/Web3';
import {
  CommunityLinks,
  CustomTab,
  ShareProfileDropdown,
  WalletAddress,
} from 'components';
import { useMediaQuery, useQueryParams } from 'hooks';
import {
  Box,
  Button,
  Flex,
  HStack,
  Link,
  Spacer,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
} from '@chakra-ui/react';
import PageContainer from 'layout/PageContainer';

const UserProfile: React.FC = () => {
  const {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    user: { addr },
  } = useWebContext();

  const isBiggerThanMobile = useMediaQuery();

  const { userAddress }: { userAddress: string } = useQueryParams({
    userAddress: 'addr',
  });

  // if there's an address provided in the query param then use it to get user information
  const currentUserAddr: string =
    userAddress === addr || !userAddress ? addr : userAddress;

  // Load here info for currentUserAddr with hook
  const {
    instagramUrl,
    twitterUrl,
    websiteUrl,
    discordUrl,
    githubUrl,
  }: { [key: string]: string } = {};

  return (
    <PageContainer>
      <Flex width="100%" flexWrap={['wrap', null, 'nowrap']}>
        <Flex
          maxWidth={[null, null, '300px', '400px']}
          width="100%"
          flexWrap="wrap"
        >
          <VStack spacing={5}>
            <Flex minW="100%">
              <Blockies
                seed={currentUserAddr}
                size={10}
                scale={isBiggerThanMobile ? 12.4 : 9.6}
                className="blockies"
              />
            </Flex>
            <Flex minW="100%">
              <Box maxW="193px">
                <WalletAddress addr={currentUserAddr} />
              </Box>
            </Flex>
            <Flex minW="100%">
              <HStack spacing={2}>
                <Link as={RouterLink} to="/profile/edit" variant="noHover">
                  <Button
                    size="lg"
                    color="black"
                    colorScheme="whiteAlpha"
                    borderWidth="1px"
                    borderColor="black"
                  >
                    Edit Profile
                  </Button>
                </Link>
                <ShareProfileDropdown userAddr={currentUserAddr} />
              </HStack>
            </Flex>
            <Flex minW="100%">
              <CommunityLinks
                instagramUrl={instagramUrl}
                twitterUrl={twitterUrl}
                websiteUrl={websiteUrl}
                discordUrl={discordUrl}
                githubUrl={githubUrl}
              />
            </Flex>
          </VStack>
        </Flex>
        <Spacer minWidth={[0, 0, 0, '72px']} maxWidth={[0, 0, 0, '72px']} />
        <Flex flexGrow={1}>
          <Tabs
            minWidth="100%"
            isFitted={!isBiggerThanMobile}
            variant="profile"
          >
            <TabList>
              <CustomTab>Activity</CustomTab>
              <CustomTab>Communities</CustomTab>
              <CustomTab>Memberships</CustomTab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <p>Here Show all Activities</p>
              </TabPanel>
              <TabPanel>
                <p>Show Communities!</p>
              </TabPanel>
              <TabPanel>
                <p>Show Memberships</p>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Flex>
      </Flex>
    </PageContainer>
  );
};

export default UserProfile;
