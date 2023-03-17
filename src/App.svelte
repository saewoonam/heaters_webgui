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
    let disabled = false;
    let server;
    if (false) {
        server = 'http://localhost:3300';
    } else {
        server = 'http://132.163.53.82:3300'
    }

    const unsubscribe = dacs.subscribe(value => {
	    dac_values = value;
	    console.log('subscribed dacs')
    });
    onDestroy(unsubscribe);
    const unsubscribe2 = lph.subscribe(value => {
	    lph_values = value;
	    console.log('subscribed lph')
    });
    onDestroy(unsubscribe2);
    onMount(async () => {
        console.log('onMount');
        // read high power heataer setting from microcontroller
        for (let i=0; i<4; i++) {
            console.log('onMount fetch settings from uController', i);
            let dac_setting = await fetch(`${server}/hph/${i}/get/current`);
            dac_setting = await dac_setting.json();
            console.log(i, 'dac_setting', dac_setting);
            if (typeof(dac_setting)=='number') {
				dacs.update(values => {values[i][1]=dac_setting; return values;})
            }
            // get heater name from monitor query 
            let command = `${server}/hph/${i}/get/monitor`;
            lock();
            let response = await fetch(command);
            response = await response.json()
            let name = Object.keys(response)[0];
            console.log(name);
            dacs.update(values=> {values[i][0]=name; return values});
            unlock();

        }
        // read low power heataer setting from microcontroller
        for (let i=0; i<5; i++) {
            console.log('fetch', i);
            /*
            let res = await fetch(`${server}/lph/${i+1}/get/current`);
            res = await res.json();
            console.log(i, res);
            if (typeof(res)=='number') {
				lph.update(values => {values[i][1]=res[name]; return values;})
            }
            */
            let command = `${server}/lph/${i+1}/get/current`;
            lock();
            let response = await fetch(command);
            response = await response.json()
            let name = Object.keys(response)[0];
            console.log(name);
            lph.update(values=> {values[i][0]=name; return values});
			lph.update(values => {values[i][1]=response[name]; return values;})
            unlock();
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
    function lock() {
        disabled = true;
    }
    function unlock() {
        disabled = false;
    }
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
        let command = `${server}/hph/${index}/set/current?i=${e.detail.value}` //setting Math.floor here wont fix the input staying at a float
        console.log('onChange command: ', command);
        lock();
        let response = await fetch(command)
        response = await response.json()
        console.log('onChange: response', response);
        unlock();
    }
    async function onChangeLPH(e) {
        let index = Number(e.detail.attributes['index'].value);
        console.log('lph changed, index:', index);
        console.log(e.detail);
        console.log(e.detail.value);
        lock();
        let command = `${server}/lph/${index+1}/set/current?i=${e.detail.value}` //setting Math.floor here wont fix the input staying at a float
        console.log('onChange command: ', command);
        console.log('onChangeLPH command: ', command);
        let response = await fetch(command)
        response = await response.json()
        console.log('onChangeLPH: response', response);
        unlock();
    }
    async function onClick(e) {
        let index = e.srcElement.attributes['index'].value;
        let command = `${server}/hph/${index}/get/monitor`;
        //console.log('onClick command: ', command)
        lock();
        let response = await fetch(command);
        response = await response.json()
        // console.log('onclick', response);
        readings[index] = JSON.stringify(response);
        unlock();
    }
    async function onReset(e) {
        let index = e.srcElement.attributes['index'].value;
        let command = `${server}/hph/${index}/reset`;
        console.log('onReset command: ', command)
        lock();
        let response = await fetch(command);
        response = await response.json()
        readings[index] = response;
        console.log(dac_values[index]);
        command = `${server}/hph/${index}/set/current?i=${dac_values[index][1]}`;
        response = await fetch(command);
        response = await response.json()
        readings[index] = response;
        unlock();
    }
    async function onReadDac(e) {
        let index = e.srcElement.attributes['index'].value;
        let command = `${server}/hph/${index}/get/current`;
        console.log('onReadDac command: ', command)
        lock();
        let response = await fetch(command);
        response = await response.json()
        readings[index] = response;
        unlock();
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
/* $: { */
/*         dac_values; */
/*         console.log("App $, dac_values changed"); */
/*     } */
</script>
<h2> High power heater control</h2>
<style>
    table {
        border: 1px solid black
    }
    table {
        
        border-spacing: 15px
        
    }
</style>
<table>	
	<tr>
		{#each columns as column}
		<th>{column}</th>
		{/each}
	</tr>
	{#each dac_values as row, index}
	<tr>
		<td>{row[0]}</td>
        <td><In index={index} disabled={disabled} store={dacs} step=1 
                extras={{min:0, max:31, style:"width: 4em;", }}
                value={row[1]}
                pattern="[0-9]" 
                on:change={onChange} />
        </td> 
        <!--
        <td><In index={index} disabled={disabled} store={dacs} step=1 
                extras={{min:0, max:31, style:"width: 4em;",
                onkeypress:"return event.charCode >= 48", }}
                value={row[1]} 
                on:change={onChange} />
        </td> 
        <td><input index={index} type="number" step ="1"> </td>
        -->
		<td><input index={index} disabled={disabled} type=checkbox bind:checked={row[2]} on:click={enable}/></td>
        <td><button index={index} disabled={disabled} on:click={onReset}>reset</button></td>
        <td><button index={index} disabled={disabled} on:click={onReadDac}>read dac</button></td>
        <td><button index={index} disabled={disabled} on:click={onClick}>read i2c</button></td>
        <td style="width: 20em;">{readings[index]}</td>
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
		<td>{row[0]}</td>
		<td><In index={index} store={lph} step=1 extras={{min:0, max:255, style:"width: 5em;", onkeypress:"return event.charCode >= 48",}} value={row[1]}  on:change={onChangeLPH} /></td>
	</tr>
	{/each}
</table>
