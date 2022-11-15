export const bound = (num, min, max) => {
	return Math.max(min, Math.min(max, num));
}