
// Mock data for testing attribution models
export const mockCustomerJourneys = [
  {
    id: 1,
    customerId: 'customer_001',
    purchaseValue: 1500,
    touchpoints: [
      { channel: 'Google Ads', timestamp: '2024-01-15T10:00:00Z', type: 'click' },
      { channel: 'Email Marketing', timestamp: '2024-01-16T14:30:00Z', type: 'open' },
      { channel: 'Facebook Ads', timestamp: '2024-01-17T09:15:00Z', type: 'click' },
      { channel: 'Direct', timestamp: '2024-01-17T16:45:00Z', type: 'purchase' }
    ]
  },
  {
    id: 2,
    customerId: 'customer_002', 
    purchaseValue: 2300,
    touchpoints: [
      { channel: 'Organic Search', timestamp: '2024-01-20T11:20:00Z', type: 'visit' },
      { channel: 'Google Ads', timestamp: '2024-01-21T13:10:00Z', type: 'click' },
      { channel: 'Email Marketing', timestamp: '2024-01-22T10:05:00Z', type: 'click' },
      { channel: 'Direct', timestamp: '2024-01-22T15:30:00Z', type: 'purchase' }
    ]
  }
];

export const calculateLastClickAttribution = (journeys: typeof mockCustomerJourneys) => {
  const channelValues: Record<string, number> = {};
  
  journeys.forEach(journey => {
    const lastTouchpoint = journey.touchpoints[journey.touchpoints.length - 2]; // Son purchase'dan önceki
    if (lastTouchpoint) {
      channelValues[lastTouchpoint.channel] = (channelValues[lastTouchpoint.channel] || 0) + journey.purchaseValue;
    }
  });
  
  return channelValues;
};

export const calculateFirstClickAttribution = (journeys: typeof mockCustomerJourneys) => {
  const channelValues: Record<string, number> = {};
  
  journeys.forEach(journey => {
    const firstTouchpoint = journey.touchpoints[0];
    if (firstTouchpoint) {
      channelValues[firstTouchpoint.channel] = (channelValues[firstTouchpoint.channel] || 0) + journey.purchaseValue;
    }
  });
  
  return channelValues;
};

export const calculateLinearAttribution = (journeys: typeof mockCustomerJourneys) => {
  const channelValues: Record<string, number> = {};
  
  journeys.forEach(journey => {
    const nonPurchaseTouchpoints = journey.touchpoints.filter(tp => tp.type !== 'purchase');
    const valuePerTouchpoint = journey.purchaseValue / nonPurchaseTouchpoints.length;
    
    nonPurchaseTouchpoints.forEach(touchpoint => {
      channelValues[touchpoint.channel] = (channelValues[touchpoint.channel] || 0) + valuePerTouchpoint;
    });
  });
  
  return channelValues;
};
