import { useState } from 'react';
import InputMask from 'react-input-mask';

// Will work fine
const TimeInput = (props) => {

	let formatChars = {
		'1': '[0-1]',
		'2': '[0-9]',
		'3': '[0-5]',
		'4': '[0-9]',
		'A': '[AP]',
		'M': 'M',
	  };
	  let beforeMaskedValueChange = (newState, oldState, userInput) => {
		let { value } = newState;
	
		// Conditional mask for the 2nd digit base on the first digit
		if(value.startsWith('1'))
		  formatChars['2'] = '[0-2]'; // To block 24, 25, etc.
		else
		  formatChars['2'] = '[0-9]'; // To allow 05, 12, etc.
		return {value, selection: newState.selection};
	  }
	return <InputMask formatChars={formatChars}
	beforeMaskedValueChange={beforeMaskedValueChange}
	 mask="12:34 AM" value={props.value} onFocus={(e)=>{
		e.target.setSelectionRange(0,2);
	 }} onChange={props.onChange} onClick={(e)=>{
		// debugger;
		const maxIndex = 7;
		 const value = e.target.value;
		 //console.log(value);
		
		const start = e.target.selectionStart;
		if(start > -1 && start<= 2) {
			e.target.setSelectionRange(0,2);
		} else if(start > 2 && start <=5) {
			e.target.setSelectionRange(3,5)
		} else {
			e.target.setSelectionRange(6,8)
		}
	  }} >
	  {(inputProps) => <input {...inputProps} type="text"  />}
	</InputMask>
  }
export default TimeInput;

