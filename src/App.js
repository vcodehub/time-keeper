import { useEffect, useState } from 'react';
import './App.css';
import TimeInput from './components/TimeInput';
import uuid from 'react-uuid';
import { Hint } from 'react-autocomplete-hint';
import moment from 'moment';

const Input =(props)=>{
	return <input {...props} onKeyUp={(e)=>{
		e.target.value = e.target.value.toUpperCase();
	}}/>
}
function App() {
	const [morningStart,setMorningStart] = useState("09:00 AM");
	const [morningEnd,setMorningEnd] = useState("01:00 PM");
	const [eveningStart, setEveningStart] = useState("02:00 PM")
	const [eveningEnd,setEveningEnd] = useState("06:00 PM");
	const [selectedgid,setSelectedgid] = useState('');
	const [refreshUI, setRefreshUI] = useState('');
	const payTypeoptions = [
		{id: 1, label: "REG"}, 
		{id: 6, label: "RAT"}, 
		{id: 2, label: "NDIF"}, 
		{id: 3, label: "H-5"},
		{id: 4, label: "S/L"}
	];
const [timekeepingData, setTimeKeepingData] = useState([{payType:'REG',gid: uuid(),workDate:'2022-12-12',
morningStart,morningEnd,eveningStart,eveningEnd,jobOrder:' 9202321',hours: 8,valid: true,seq: 0}]);
const [AutomatedtimeKeepingData, setAutomatedtimeKeepingData] = useState([]);
const timeSum = (time1,time2)=>{
	
	var hour=0;
	var minute=0;
	
	var splitTime1= time1.split(':');
	var splitTime2= time2.split(':');
	
	hour = parseInt(splitTime1[0])+parseInt(splitTime2[0]);
	minute = parseInt(splitTime1[1])+parseInt(splitTime2[1]);
	hour = hour + minute/60;
	minute = minute%60;
	hour = Math.round(hour);
	//second = parseInt(splitTime1[2])+parseInt(splitTime2[2])+parseInt(splitTime3[2]);
	//minute = minute + second/60;
	//second = second%60;
	return pad(hour) +':'+ pad(minute)
}
  
  const pad=(num)=> {
	if(num < 10) {
	  return "0" + num;
	} else {
	  return "" + num;
	}
  }
  const isDay =(dt)=> {
    return (dt + 60000 * new Date().getTimezoneOffset() + 21600000) % 86400000 / 3600000 > 12;
}
const timeDiff = (start, end)=>{
	 start = start.split(":");
     end = end.split(":");
	 if(start[2] === 'PM') {
		start[0]  = parseInt(start[0]) + 12;
	 }
	 if(end[2] === 'PM') {
		end[0] = parseInt(end[0]) + 12;
	 }
    var startDate = new Date(0, 0, 0, start[0], start[1], 0);
    var endDate = new Date(0, 0, 0, end[0], end[1], 0);
    var diff = endDate.getTime() - startDate.getTime();
    var hours = Math.floor(diff / 1000 / 60 / 60);
    diff -= hours * 1000 * 60 * 60;
    var minutes = Math.floor(diff / 1000 / 60);
	// hours = Math.round(hours)
    // If using time pickers with 24 hours format, add the below line get exact hours
    if (hours < 0)
       hours = hours + 24;

    return (hours <= 9 ? "0" : "") + hours + ":" + (minutes <= 9 ? "0" : "") + minutes;
}
const validateOverlapping = (start,end,dt) =>{
	
	start = start.split(":");
	end = end.split(":");
	dt = dt.split(":");
	if(start[2] === 'PM') {
	   start[0]  = parseInt(start[0]) + 12;
	}
	if(end[2] === 'PM') {
	   end[0] = parseInt(end[0]) + 12;
	}
	if(dt[2] === 'PM') {
		dt[0] = parseInt(dt[0]) + 12;
	}
	var startDate = new Date(0, 0, 0, start[0], start[1], 0);
   var endDate = new Date(0, 0, 0, end[0], end[1], 0);
   var dtDate = new Date(0, 0, 0, dt[0], dt[1], 0);
   if((startDate instanceof Date && !isNaN(startDate)) && 
	(endDate instanceof Date && !isNaN(endDate)) && dtDate instanceof Date && !isNaN(dtDate))
	{
		if(dtDate > startDate && dtDate < endDate)
		return false;
	else return true;
	} 
	return true;
   
}
const calculateDifference = (date,start,end) =>{
	// const timeData = timekeepingData.find(p=>p.gid === gid);
	start = start.replace(' AM',':00 AM').replace(' PM',':00 PM')
	end = end.replace(' AM',':00 AM').replace(' PM',':00 PM')
	 const startTime = moment(`${date} ${start}`,'YYYY-MM-DD hh:mm:ss A');
	 let endTime = moment(`${date} ${end}`,'YYYY-MM-DD hh:mm:ss A');
	 let moringdiff = 0;
	if(start.indexOf('PM')> -1 && end.indexOf('AM')>-1) {
		endTime = moment(moment(endTime.add(1,'d').toDate()).format('YYYY-MM-DD hh:mm:ss A'));
	}
	 moringdiff = endTime.diff(startTime,'minutes');
	if(isNaN(moringdiff))
		return 0;
	return moringdiff;
}
const calculateNDIF = (date, start,end) =>{
	const format = "YYYY-MM-DD hh:mm a";
	const before = '06:30 PM';
	const after = '06:30 AM';
	const beforeTime = moment(date+' '+ before, format);
    let afterTime = moment(date+' '+after, format);
	const startTime = moment(date+' ' +start,format);
	let endTime = moment(date+' '+end,format);
	afterTime = moment(moment(afterTime.add(1,'d').toDate()).format('YYYY-MM-DD hh:mm A'));
	if(start.indexOf('PM')> -1 && end.indexOf('AM')>-1) {
		endTime = moment(moment(endTime.add(1,'d').toDate()).format('YYYY-MM-DD hh:mm A'));
	}
	const timeKeep = {};
	/* If Start early and end in night */
	if(startTime.isBefore(beforeTime) && endTime.isBetween(beforeTime,afterTime,undefined,'[]')) {
		timeKeep["start"] = before;
		timeKeep["end"] = end;
		return timeKeep
	} else if (startTime.isBetween(beforeTime, afterTime,undefined,'[]') && endTime.isBetween(beforeTime,afterTime,undefined,'[]')) /* If start later in night and end in night */
	{
		timeKeep["start"] = start;
		timeKeep["end"] = end;
		return timeKeep
	} else if(startTime.isBetween(beforeTime, afterTime,undefined,'[]') && endTime.isSameOrAfter(afterTime) ) /* start in night and end in days */ {
		timeKeep["start"] = start;
		timeKeep["end"] = after;
		return timeKeep;	
	} else if(startTime.isBefore(beforeTime) && endTime.isSameOrAfter(afterTime) ) /* Started before and completed later */ {
		timeKeep["start"] = before;
		timeKeep["end"] = after;
		return timeKeep;	
	}
	return null;

}
const handleNDIF=(timeData)=> {
	let localAutomatedtimeKeepingData = AutomatedtimeKeepingData;
	const morningNDIF = calculateNDIF(timeData.workDate, timeData.morningStart, timeData.morningEnd);
	const eveningNDIF = calculateNDIF(timeData.workDate,timeData.eveningStart, timeData.eveningEnd);
	localAutomatedtimeKeepingData = AutomatedtimeKeepingData.filter(d=>(d.parent !== timeData.gid && d.type === 'NDIF') || d.parent === undefined);		
	if(morningNDIF != null || eveningNDIF != null) {
		const timeDataNDIF = Object.assign({},timeData);
		timeDataNDIF.morningStart = "";
		timeDataNDIF.morningEnd ="";
		timeDataNDIF.eveningStart ="";
		timeDataNDIF.eveningEnd = "";
		timeDataNDIF.gid = uuid();
		timeDataNDIF.parent = timeData.gid;
		timeDataNDIF.type = 'NDIF';
		timeDataNDIF.payType = 'NDIF';
		if(morningNDIF != null) {
			timeDataNDIF.morningStart = morningNDIF.start;
			timeDataNDIF.morningEnd = morningNDIF.end;
		}
		if(eveningNDIF != null) {
			timeDataNDIF.morningStart = eveningNDIF.start;
			timeDataNDIF.morningEnd = eveningNDIF.end;
		}
		const morningNDIFHrs = calculateDifference(timeDataNDIF.workDate, timeDataNDIF.morningStart, timeDataNDIF.morningEnd);
		const eveningNDIFHrs = calculateDifference(timeDataNDIF.workDate, timeDataNDIF.eveningStart, timeDataNDIF.eveningEnd);
		const totalNDIFMinutes = morningNDIFHrs + eveningNDIFHrs;
		timeDataNDIF.hours = pad(Math.floor(totalNDIFMinutes /60)  )+":"+ pad( totalNDIFMinutes % 60);
		localAutomatedtimeKeepingData.splice(localAutomatedtimeKeepingData.indexOf(localAutomatedtimeKeepingData.find(d=>d.parent === timeData.gid)),0,timeDataNDIF)
	}
	setAutomatedtimeKeepingData(localAutomatedtimeKeepingData);
}
const calculateTime = (gid)=>{
	const timeData = timekeepingData.find(p=>p.gid === gid);
	if(!timeData)
		return;
	const morningHrs = calculateDifference(timeData.workDate, timeData.morningStart, timeData.morningEnd);
	const eveningHrs = calculateDifference(timeData.workDate, timeData.eveningStart, timeData.eveningEnd);
	const totalMinutes = morningHrs + eveningHrs;
	timeData.hours = pad(Math.floor(totalMinutes /60)  )+":"+ pad( totalMinutes % 60);
	handleNDIF(timeData);
	if(timeData.eveningEnd )
	if(!validateOverlapping(timeData.morningStart, timeData.morningEnd,timeData.eveningStart))
		{
			timeData.valid = false;
			return;
	}
	else if(!validateOverlapping(timeData.morningStart, timeData.morningEnd,timeData.eveningEnd)){
		timeData.valid = false;
		return;
	} else {
		timeData.valid = true;
	}
	setTimeKeepingData(timekeepingData);
	setRefreshUI(uuid());

}
useEffect(()=>{
	if(selectedgid !== '') {
		calculateTime(selectedgid);
	}
}, [timekeepingData, selectedgid])

const renderTime = (item, automated)=> {
	return <tr style={{backgroundColor:(item.valid === true ?'':'red')}}>
	<td>{automated !== true ?'X':''}</td>
	<td border="0">
		<Hint disableHint={automated === true} allowTabFill={true} allowEnterFill={true} options={payTypeoptions}>
			<input disabled={automated === true} pattern="[A-Z]*" value={item.payType} onKeyUp={(e)=>{
e.target.value = e.target.value.toUpperCase();
}} onChange={(e)=>{
			setTimeKeepingData(timekeepingData.map(el => (el.gid === item.gid ? {...el, payType: e.target.value} : el))
			)
		}} />
			</Hint> 
	</td>
	<td>
		<input disabled={automated === true} type="textbox" value={item.workDate} onChange={(e)=>{
		setTimeKeepingData(timekeepingData.map(el => (el.gid === item.gid ? {...el, workDate: e.target.value} : el))
		)
	}}/>
	</td>
	<td>
	<TimeInput disabled={automated === true} value={item.morningStart} onChange={(e)=>{

		setTimeKeepingData(timekeepingData.map(el => (el.gid === item.gid ? {...el, morningStart: e.target.value} : el))
		  ) 
		  setSelectedgid(item.gid);
		  }}/>
<TimeInput  disabled={automated === true} value={item.morningEnd} onChange={(e)=>{
setTimeKeepingData(timekeepingData.map(el => (el.gid === item.gid ? {...el, morningEnd: e.target.value} : el))
)
setSelectedgid(item.gid);
}}/>
	</td>
	<td>
	<TimeInput disabled={automated === true} value={item.eveningStart} onChange={(e)=>{
	setTimeKeepingData(timekeepingData.map(el => (el.gid === item.gid ? {...el, eveningStart: e.target.value} : el))
	);
	setSelectedgid(item.gid);
	}}/>
<TimeInput disabled={automated === true} value={item.eveningEnd} onChange={(e)=>{
setTimeKeepingData(timekeepingData.map(el => (el.gid === item.gid ? {...el, eveningEnd: e.target.value} : el))
)
setSelectedgid(item.gid);
}}/>
	</td>
	<td><input disabled={true} type="text" value={item.hours} onChange={(e)=>{
setTimeKeepingData(timekeepingData.map(el => (el.gid === item.gid ? {...el, hours: e.target.value} : el))
)
}}/></td>
	<td><input disabled={automated === true} type="text" value={item.jobOrder} onChange={(e)=>{
setTimeKeepingData(timekeepingData.map(el => (el.gid === item.gid ? {...el, jobOrder: e.target.value} : el))
)
}}/></td>
</tr>
}
  return (
    <div className="App">
		<button onClick={()=>{
			const localData = [...timekeepingData];
			localData.push({payType:'REG',gid: uuid(),workDate:'2022-12-12',
			morningStart,morningEnd,eveningStart,eveningEnd,jobOrder:' 9202321',hours:8,valid: true,seq: 0})
			setTimeKeepingData(localData)
		}}>Add New</button>
		<table border={1}>
			<thead>
				<tr><th></th>
					<th>Pay Type</th>
					<th>Date</th>
					<th>Morning</th>
					<th>Evening</th>
					<th>Total hours</th>
					<th>JobOrder</th>
				</tr>
			</thead>
			<tbody>
				{timekeepingData.map(item=> {
					return <>
					{renderTime(item)}
					{AutomatedtimeKeepingData.filter(d=>d.parent== item.gid).map(d=>{
						return renderTime(d,true)
					})}

				</>
				})}
				
			</tbody>
		</table>
		
    </div>
  );
}

export default App;
