import { privateApi } from "./axios";

export const getPatientProfiles = () => {
  console.log('API: Fetching patient profiles...');
  return privateApi.get('/patient-profiles');
};

export const addPatientProfile = (profileData) => {
  console.log('API: Adding patient profile:', profileData);
  return privateApi.post('/patient-profiles', profileData);
};

export const updatePatientProfile = (id, profileData) => {
  return privateApi.put(`/patient-profiles/${id}`, profileData);
};

export const deletePatientProfile = (id) => {
  return privateApi.delete(`/patient-profiles/${id}`);
};
