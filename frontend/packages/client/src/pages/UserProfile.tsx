import Blockies from 'react-blockies';
import { useWebContext } from 'contexts/Web3';
import { CommunityLinks } from 'components';
import WalletAddress from 'components/WalletAddress';
import { useMediaQuery } from 'hooks';
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

  return (
    <PageContainer>
      <Flex width="100%" flexWrap={['wrap', null, 'nowrap']}>
        <Flex maxWidth={[null, null, '400px']} width="100%" flexWrap="wrap">
          <Flex minW="100%">
            <Blockies
              seed={addr}
              size={10}
              scale={isBiggerThanMobile ? 12.4 : 9.6}
              className="blockies"
            />
          </Flex>
          <Flex pt="24px" minW="100%">
            <Box maxW="193px">
              <WalletAddress addr={addr} />
            </Box>
          </Flex>
          <Flex bg="blue" minW="100%">
            Buttons
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
        {/* <Spacer minWidth={[0, 0, '72px']} /> */}
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
