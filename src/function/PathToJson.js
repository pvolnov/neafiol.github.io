

export default function PathToJson(params){
    params = "{\"" +
        params
            .replace( /\#/gi, "" )
            .replace( /\&/gi, "\",\"" )
            .replace( /\=/gi, "\":\"" ) +
        "\"}";
    try {
        return JSON.parse(params);
    }
    catch (e) {
        return {};
    }
}