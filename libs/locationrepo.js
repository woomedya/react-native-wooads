import judel from 'judel';
import AsyncStorage from '@react-native-community/async-storage';

const adaptor = judel.adaptor.AsyncStorage(AsyncStorage);
const repo = new judel.Repo({ adaptor });
const settingsModel = repo.create("nodemodules_wooads");

var defaultSettings = {
    coordinate: '',
};

var cacheValue = null;

const get = async () => {
    if (cacheValue == null) {
        var list = await settingsModel.list();
        if (list.length) {
            cacheValue = list[0];
        } else {
            cacheValue = defaultSettings;
        }
    }
    return cacheValue;
}

const set = async (key, value) => {
    cacheValue = await get();
    cacheValue[key] = value;
    await settingsModel.upsert(cacheValue);
}

export const getCoordinate = async () => {
    var value = await get();
    return value.coordinate;
}

export const setCoordinate = async (value) => {
    await set("coordinate", value);
}
