import Blockies from 'react-blockies';
import { useWebContext } from 'contexts/Web3';
import { CommunityLinks } from 'components';
import ShareDropdown from 'components/ShareDropdown';
import WalletAddress from 'components/WalletAddress';
import { useMediaQuery, useQueryParams } from 'hooks';
import { Box, Flex, Spacer } from '@chakra-ui/react';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
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
  const currentUserAddr =
    userAddress === addr || !!userAddress ? addr : userAddress;

  // Load here info for currentUserAddr with hook

  return (
    <PageContainer>
      <Flex width="100%" flexWrap={['wrap', null, 'nowrap']}>
        <Flex maxWidth={[null, null, '400px']} width="100%" flexWrap="wrap">
          <Flex minW="100%">
            <Blockies
              seed={currentUserAddr}
              size={10}
              scale={isBiggerThanMobile ? 12.4 : 9.6}
              className="blockies"
            />
          </Flex>
          <Flex pt="24px" minW="100%">
            <Box maxW="193px">
              <WalletAddress addr={currentUserAddr} />
            </Box>
          </Flex>
          <Flex minW="100%">
            <ShareDropdown twitterShareString={''} copyString={''} />
          </Flex>
          <Flex minW="100%">
            <CommunityLinks
              instagramUrl="dfdf"
              twitterUrl="dfdf"
              websiteUrl="dfdf"
              discordUrl="dfdf"
              githubUrl="dfdf"
            />
          </Flex>
        </Flex>
        <Spacer minWidth={[0, 0, '72px']} maxWidth={[0, 0, '72px']} />
        <Flex flexGrow={1}>
          <Tabs>
            <TabList>
              <Tab>Activity</Tab>
              <Tab>Communities</Tab>
              <Tab>Memberships</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <p>All Activities</p>
              </TabPanel>
              <TabPanel>
                <p>Communities!</p>
              </TabPanel>
              <TabPanel>
                <p>Memberships</p>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Flex>
      </Flex>
    </PageContainer>
  );
};

export default UserProfile;
