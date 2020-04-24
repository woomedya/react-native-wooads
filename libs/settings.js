import judel from 'judel';
import AsyncStorage from '@react-native-community/async-storage';

var adaptor = judel.adaptor.AsyncStorage(AsyncStorage);

const repo = new judel.Repo({
    adaptor
});

const settingsModel = repo.create("wooads_settings");

var defaultSettings = {
    initial: false
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

export const getInitial = async () => {
    var value = await get();
    if (value.initial == false)
        setInitial(true);
    return value.initial;
}

export const getInitialSync = () => {
    return (cacheValue && cacheValue.initial) || defaultSettings.initial;
}

export const setInitial = async (value) => {
    await set("initial", value);
}