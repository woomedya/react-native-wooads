import Crypto from 'woo-crypto';
import { getUTCTime } from './date';
import opts from '../config';
import Axios from "axios";

const post = async (baseURL, url, headers, data) => {
    var instance = Axios.create({
        baseURL: baseURL,
        timeout: 10000,
        headers: { 'Content-Type': 'application/json', ...headers }
    });
    var responseJson = await instance.post(url, data);

    return responseJson.data
}

const requestGetWooads = async (obj) => {
    var url = opts.serverUrl + "/ads/get";
    var type = 'ads.get';
    return (await baseRequest(url, type, obj) || {}).data;
}

const requestSetWooadsView = async (obj) => {
    var url = opts.serverUrl + "/ads/view";
    var type = 'ads.view';
    return (await baseRequest(url, type, obj) || {}).data;
}

const baseRequest = async (url, type, obj) => {
    try {
        var token = (Crypto.encrypt(JSON.stringify({ expire: getUTCTime(opts.tokenTimeout).toString(), type }), opts.publicKey, opts.privateKey));
        var result = await post(url, "", {
            public: opts.publicKey,
            token
        }, {
            ...obj
        });

        return result;
    } catch (error) {
        return null;
    }
}

export const getApi = async (deviceId, locationCoordinate) => {
    try {
        var responseJson = (await requestGetWooads({
            applicationId: opts.applicationId,
            coordinate: locationCoordinate,
            deviceId: deviceId
        }))
        return responseJson;
    } catch (error) {
        var eror = {}
        return eror;
    }
}

export const setViewApi = async (sessionKey) => {
    try {
        var responseJson = (await requestSetWooadsView({
            sessionKey: sessionKey,
            applicationId: opts.applicationId
        }))
        return responseJson;
    } catch (error) {
        return {};
    }
}