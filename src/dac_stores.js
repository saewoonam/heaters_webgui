import { writable } from 'svelte/store';

export const dacs = writable([
	['hph0',0, false],
	['hph1',0, false],
	['hph2',0, false],
	['hph3',0, false],
]);
