//深拷贝
export function deepClone(obj) {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}
	if (obj instanceof Date) {
		return new Date(obj);
	}
	if (obj instanceof Array) {
		return obj.map(item => deepClone(item));
	}
	if (obj instanceof Object) {
		const clone = {};
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				clone[key] = deepClone(obj[key]);
			}
		}
		return clone;
	}
	return obj;
}