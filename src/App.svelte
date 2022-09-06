<script>
    import { onMount, tick, onDestroy } from 'svelte';
	import In from './In.svelte'
	import { dacs } from './dac_stores.js';
	import { lph } from './lph_stores.js';
    let readings = ['', '', '', '']	
	if (navigator.serial) {
		console.log('has serial');
	}
	let dac_values;
	let columns = ['Name', 'value', 'on/off','reset', 'read dac', 'read i2c v,i', 'response']
    let lph_columns = ['Name', 'value'];
    let lph_values;
    let server;
    if (true) {
        server = 'http://127.0.0.1:3200';
    } else {
        server = 'http://132.163.53.82:3200'
    }

    const unsubscribe = dacs.subscribe(value => {
	    dac_values = value;
	    console.log('subscribed')
    });
    onDestroy(unsubscribe);
    const unsubscribe2 = lph.subscribe(value => {
	    lph_values = value;
	    console.log('subscribed')
    });
    onDestroy(unsubscribe2);
    onMount(async () => {
        console.log('onMount');
        // read high power heataer setting from microcontroller
        for (let i=0; i<4; i++) {
            console.log('fetch', i);
            let res = await fetch(`${server}/hph/${i}/get/current`);
            res = await res.json();
            console.log(i, res);
            if (typeof(res)=='number') {
				dacs.update(values => {values[i][1]=res; return values;})
            }
        }
        // read low power heataer setting from microcontroller
        for (let i=0; i<4; i++) {
            console.log('fetch', i);
            let res = await fetch(`${server}/lph/${i+1}/get/current`);
            res = await res.json();
            console.log(i, res);
            if (typeof(res)=='number') {
				lph.update(values => {values[i][1]=res; return values;})
            }
        }
        // read enabled setting from microcontroller
        for (let i=0; i<4; i++) {
            console.log('fetch', i);
            let res = await fetch(`${server}/hph/${i}/get/enabled`);
            res = await res.json();
            console.log(i, res);
            if (typeof(res)=='number') {
				dacs.update(values => {values[i][2]=res; return values;})
            }
        }
        console.log('done reading heater values from the microcontroller');
    });
    async function click() {
        console.log('click');
        let response = await fetch('${server}/hph/0/set/current?i=0');
        console.log('response', await response.json());
    }
    async function onChange(e) {
        let index = e.detail.attributes['index'].value;
        console.log('dac changed, index:', index);
        console.log(e.detail);
        console.log(e.detail.value);
        let command = `${server}/hph/${index}/set/current?i=${e.detail.value}`
        console.log('onChange command: ', command);
        let response = await fetch(command)
        response = await response.json()
        console.log('onChange: response', response);
    }
    async function onChangeLPH(e) {
        let index = Number(e.detail.attributes['index'].value);
        console.log('dac changed, index:', index);
        console.log(e.detail);
        console.log(e.detail.value);
        let command = `${server}/lph/${index+1}/set/current?i=${e.detail.value}`
        console.log('onChangeLPH command: ', command);
        let response = await fetch(command)
        response = await response.json()
        console.log('onChangeLPH: response', response);
    }
    async function onClick(e) {
        let index = e.srcElement.attributes['index'].value;
        let command = `${server}/hph/${index}/get/monitor`;
        console.log('onClick command: ', command)
        let response = await fetch(command);
        response = await response.json()
        readings[index] = response;
    }
    async function onReset(e) {
        let index = e.srcElement.attributes['index'].value;
        let command = `${server}/hph/${index}/reset`;
        console.log('onReset command: ', command)
        let response = await fetch(command);
        response = await response.json()
        readings[index] = response;
    }
    async function onReadDac(e) {
        let index = e.srcElement.attributes['index'].value;
        let command = `${server}/hph/${index}/get/current`;
        console.log('onReadDac command: ', command)
        let response = await fetch(command);
        response = await response.json()
        readings[index] = response;
    }
    async function enable(e) {
        let index = e.srcElement.attributes['index'].value;
        console.log('enable button');
        console.log(index, e.srcElement.checked);
        let value = 0
        if (e.srcElement.checked) {
            value = 1
        }
        let command = `${server}/hph/${index}/set/enabled?value=${value}`
        console.log('command', command);
        let response = await fetch(command);
        response = await response.json()
        readings[index] = response;
    }
$: {
        dac_values;
        console.log("App $, dac_values changed");
    }
</script>
<!--
<button on:click={click}> click
</button>
-->
<!--
<h1>
	{dac_values[3]}
</h1>
-->
<h2> High power heater control </h2>
<table>	
	<tr>
		{#each columns as column}
		<th>{column}</th>
		{/each}
	</tr>
	{#each dac_values as row, index}
	<tr>
		<td><input bind:value={row[0]} style="width: 5em;" /></td>
		<td><In index={index} store={dacs} step=1 extras={{min:0, max:31, style:"width: 7em;"}} value={row[1]}  on:change={onChange} /></td>
		<td><input index={index} type=checkbox bind:checked={row[2]} on:click={enable}/></td>
        <td><button index={index} on:click={onReset}>reset</button></td>
        <td><button index={index} on:click={onReadDac}>read dac</button></td>
        <td><button index={index} on:click={onClick}>read i2c</button></td>
        <td>{readings[index]}</td>
	</tr>
	{/each}
</table>
<h2> Low power heater control </h2>
<table>	
	<tr>
		{#each lph_columns as column}
		<th>{column}</th>
		{/each}
	</tr>
	{#each lph_values as row, index}
	<tr>
		<td><input bind:value={row[0]} style="width: 5em;" /></td>
		<td><In index={index} store={dacs} step=1 extras={{min:0, max:255, style:"width: 7em;"}} value={row[1]}  on:change={onChangeLPH} /></td>
	</tr>
	{/each}
</table>

