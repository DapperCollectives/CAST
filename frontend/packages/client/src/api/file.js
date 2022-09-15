import { API_BASE_URL, IPFS_GETWAY } from './constants';
import { checkResponse } from 'utils';

export const uploadFileApiReq = async ({ image }) => {
  const formData = new FormData();
  formData.append('file', image);
  const url = `${API_BASE_URL}/upload`;
  const fetchOptions = {
    method: 'POST',
    body: formData,
  };
  const response = await fetch(url, fetchOptions);
  const upload = await checkResponse(response);
  // complete url on IPFS
  const fileUrl = `${IPFS_GETWAY}/${upload.cid}`;
  return { ...upload, fileUrl };
};
