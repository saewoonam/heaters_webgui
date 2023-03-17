<script>
	import { createEventDispatcher } from 'svelte';
	import { tick } from 'svelte';
	// change code to get store as a parameter
	// import { dacs } from './dac_stores.js';
	const dispatch = createEventDispatcher();
	function onBlur(e) {
		console.log('onBlur', value, e.target.value);
		if (value != e.target.value) {
			//comp_value = Number(e.target.value)
			value = Number(e.target.value); //Value in which what gui shows
			//console.log('change', e.target)
			dispatch('change', e.target)
			if (index>-1) {
				//dacs.update(values => {values[index][1]=value; return values;})
				store.update(values => {values[index][1]=value; return values;})
			}
		}
	}
	function onFocus(e) {
		console.log('focus');
	}
		
	function onKeyup(e) {
		let text = e.type +
				' key=' + e.key +
				' code=' + e.code +
				(e.shiftKey ? ' shiftKey' : '') +
				(e.ctrlKey ? ' ctrlKey' : '') +
				(e.altKey ? ' altKey' : '') +
				(e.metaKey ? ' metaKey' : '') +
				(e.repeat ? ' (repeat)' : '') +
				"\n";

		if (e.key=="ArrowRight" & e.ctrlKey) { step /=10}
		if (e.key=="ArrowLeft" & e.ctrlKey) { step *=10;}
		if (e.key=="Enter") {onBlur(e)}
		console.log(text);
	}
	//	Checks for symbol inputs lower than 0's keyCode (like periods) 
	//	& letters greater than 9's keyCode
    function onKeypress(e) {
        console.log('onKeypress: Input key code =', e.keyCode, 'key', e.key.charCodeAt(0))
        let keyCode = e.key.charCodeAt(0);
        if (keyCode > 57 || keyCode < 48){
            // console.log('symbol or letter is pressed', e.keyCode);
            e.preventDefault();
        }
    }

	export let value=0;
	export let step=0.01
	export let placeholder = '';
	export let inputClasses = '';
	export let extras={};
    export let id=''
	export let index=-1;
	export let store={};
    export let disabled=false;
	let inputEl;

  //$: console.log('In $', value);

</script>
<input 
    type="number"
    disabled={disabled}
    id={id}
    {value}
    step={step}
    class={inputClasses}
    bind:this={inputEl}
    {placeholder}
    {...extras}
    on:blur={onBlur}
    on:keypress={onKeypress}
    on:focus={onFocus} 
    on:keyup|stopPropagation={onKeyup}
    on:mousewheel={()=>{;}}
    index={index}
    store={store}
/>
