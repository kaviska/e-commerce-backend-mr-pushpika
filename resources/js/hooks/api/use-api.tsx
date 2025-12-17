import axios from 'axios';

export const useApi = (uri: string, setData: (data: any) => void, callback?: (data: any) => void) => {
    axios
        .get(uri)
        .then((res) => {
            return res.data;
        })
        .then((data) => data.data)
        .then((data) => {
            setData(data);
            if (callback) callback(data);
        })
        .finally(() => {
            return null;
        });
};
