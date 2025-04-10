import React, { useState, useEffect } from 'react';
import { 
  ScheduleTable, 
  ScheduleHeader, 
  ScheduleRow, 
  ScheduleCell, 
  ScheduleTime, 
  ScheduleSpots,
  SectionTitle,
  TabContainer,
  TabList,
  Tab,
  TabContent
} from '../styles';
import { ClassScheduleItem, TimeOfDay } from '../types';
import { getSchedule } from '../services/api';

interface ClassScheduleProps {
  providerId: string;
}

const ClassSchedule: React.FC<ClassScheduleProps> = ({ providerId }) => {
  const [schedule, setSchedule] = useState<ClassScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TimeOfDay>('morning');

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const data = await getSchedule(providerId, activeTab);
        setSchedule(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load schedule. Please try again later.');
        setLoading(false);
        console.error('Error fetching schedule:', err);
      }
    };

    fetchSchedule();
  }, [providerId, activeTab]);

  const handleTabChange = (tab: TimeOfDay) => {
    setActiveTab(tab);
  };

  const isSpotAvailable = (spots: string): boolean => {
    const [available, total] = spots.split('/').map(Number);
    return available > 0;
  };

  if (loading) {
    return <div>Loading schedule...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      <SectionTitle>Class Schedule</SectionTitle>
      
      <TabContainer>
        <TabList>
          <Tab 
            active={activeTab === 'morning'} 
            onClick={() => handleTabChange('morning')}
          >
            Morning
          </Tab>
          <Tab 
            active={activeTab === 'afternoon'} 
            onClick={() => handleTabChange('afternoon')}
          >
            Afternoon
          </Tab>
          <Tab 
            active={activeTab === 'evening'} 
            onClick={() => handleTabChange('evening')}
          >
            Evening
          </Tab>
        </TabList>
        
        <TabContent>
          <ScheduleTable>
            <thead>
              <tr>
                <ScheduleHeader>Time</ScheduleHeader>
                <ScheduleHeader>Class</ScheduleHeader>
                <ScheduleHeader>Instructor</ScheduleHeader>
                <ScheduleHeader>Availability</ScheduleHeader>
              </tr>
            </thead>
            <tbody>
              {schedule.length > 0 ? (
                schedule.map((item, index) => (
                  <ScheduleRow key={index}>
                    <ScheduleCell>
                      <ScheduleTime>{item.time}</ScheduleTime>
                    </ScheduleCell>
                    <ScheduleCell>{item.class}</ScheduleCell>
                    <ScheduleCell>{item.instructor}</ScheduleCell>
                    <ScheduleCell>
                      <ScheduleSpots available={isSpotAvailable(item.spots)}>
                        {item.spots}
                      </ScheduleSpots>
                    </ScheduleCell>
                  </ScheduleRow>
                ))
              ) : (
                <ScheduleRow>
                  <ScheduleCell colSpan={4} style={{ textAlign: 'center' }}>
                    No classes scheduled for this time period.
                  </ScheduleCell>
                </ScheduleRow>
              )}
            </tbody>
          </ScheduleTable>
        </TabContent>
      </TabContainer>
      
      <p className="mt-4">
        Note: Class schedules are subject to change. Please arrive 10 minutes before class starts.
      </p>
    </div>
  );
};

export default ClassSchedule;
