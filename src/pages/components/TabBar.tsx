import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Camera from './Camera';

export default function TabBar({}) {
  return (
    <Tabs>
      <TabList>
        <Tab>Camera</Tab>
        <Tab>Picture</Tab>
        <Tab>Result</Tab>
      </TabList>

      <TabPanel>
        <Camera />
      </TabPanel>
      <TabPanel>
        <h2>Any content 2</h2>
      </TabPanel>
      <TabPanel>
        <h2>Any content 3</h2>
      </TabPanel>
    </Tabs>
  );
}
