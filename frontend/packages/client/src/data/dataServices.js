import contractsAndPaths from './contractsAndPaths.json';

// There exist only two types namely: TOKEN and NFT
export const getContractsAndPathsDataWithType = (type = 'TOKEN') => {
  return contractsAndPaths.filter((item) => {
    return item.type === type;
  });
};

export const getContractsAndPathsDataWithKeyValue = (key, value) => {
  return contractsAndPaths.find((item) => {
    return item[key] === value;
  });
};
