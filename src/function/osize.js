export default function osize(o) {

    try {
        if (o && o != null) {
            return o.length;
        } else {
            return null;
        }
    }
    catch (e) {
        return null
    }

}