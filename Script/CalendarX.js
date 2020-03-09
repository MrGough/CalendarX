/* 

	###################################################
	## 						 CALENDAR CONTROLLER							 ##
	###################################################
	
	- EDWARD GOUGH
	- UPDATED 09/03/2020
	- http://www.edwardgough.co.uk/portfolio/calendarx/
	
*/

// HANDLE CALENDAR INPUT ON LOAD
$('input[data-calendarx="1"]').each( function(Event)
{ 
	Generate_CalendarX (this, Event);
});

// HANDLE CLICK (ACTION DATE SELECTION)
$('.DateSelector > span').on('click', function(Event)
{
	Handle_Action (this, Event);
});



// -----


function Generate_CalendarX (Selected, Event)
{
	// CURRENT DATA
	let Pre_Selected_Date = $(Selected).attr('data-save');
	let Input_ID = $(Selected).attr('data-inputid');
	let Input_Label = $(Selected).attr('data-label');
	let Rule_Set = $(Selected).attr('data-ruleset');
	let Information_Container_Span = $('[data-inputlink="'+Input_ID+'"]');
	
	// CALENDAR BUILD VALUES
	let CalendarContainer = '';
	let CalendarInputs = '';
	let Class = '';
	let CalendarLabel = (!Pre_Selected_Date ? "<h3 class='red'>"+Input_Label+"</h3>" : "<h3>"+Input_Label+"</h3>");
	
	// CALENDAR INFORMATION VALUES

	let Exlusions_List = $(Selected).attr('data-exclusions');
	let Date_Selection_String = $(Selected).attr('data-dateselection');
	
	
	// CALENDAR INFORMATION VALUES FORMATED
	let Date_Selection;
	
	// DETERMINE GENERATION TYPE
	if (!!Date_Selection_String)
	{
		Date_Selection = JSON.parse(Date_Selection_String);
	}
	else
	{
		Date_Selection = Generate_Dates (Selected, Rule_Set);
	}
	

	
	// ITERATE EACH DATE RECORD
	$.each(Date_Selection, function(Key, Record)
	{	
		// PARSED DATE VALUE
		let Formated_Date = FormatDate(Record.Date);

		// EXCLUSION OUTCOME
		let Exclusion_Date = Exclusion_Date_Parse (Exlusions_List);
		let Exclusion_Day = Exclusion_Day_Parse (Exlusions_List);
		
		// EXCLUSION FOUND
		if (Exclusion_Date.Found || Exclusion_Day.Found)
		{
			let Match_Found_Date = (
				$.inArray(parseInt(Formated_Date.D).toString(), Exclusion_Date.Dates) >= 0 ? true : false
			);
			
			let Match_Found_Day = (
				$.inArray(Formated_Date.WDS, Exclusion_Day.Days) >= 0 ? true : false
			);
			
			if (Match_Found_Day || Match_Found_Date) Date_Selection = Push_Builder(Date_Selection, Key);
		}
		
	});

	// GENERATE DATE DISPLAY
	$.each(Date_Selection, function(i, Date)
	{
		let Class = '';
		let PassedDate = FormatDate(Date.Date);
		let SaveDateValue = PassedDate.Y+'-'+PassedDate.M+'-'+PassedDate.D;
		
		// SET OPTIONS
		Class = (Date.Status == 'Excluded' ? 'Disabled' : Date.Status == 'Warning' ? 'Good' : 'Perfect');
		
		// CALENDAR DATE RECORD OPTION
		CalendarInputs += '<span class="'+Class+'" data-datevalue="'+SaveDateValue+'"><p class="WeekDay">'+PassedDate.WDS+'</p><p class="MonthNumber">'+PassedDate.D+'</p><p class="MonthTitle">'+PassedDate.MNS+'</p></span>';
	});
	
	// BUILD AND SET CALENDAR DISPLAY
	CalendarContainer = '<div class="DateSelector" data-connectinput="'+Input_ID+'">'+CalendarInputs+'</span>';
	
	
	
	$(Selected).after(CalendarContainer);
	$(Selected).before(CalendarLabel);
	
	$(Selected).hide();
	
	// SELECTION ALREADY MADE
	if (!!Pre_Selected_Date)
	{
		Clicked_Date ( $('[data-datevalue="'+Pre_Selected_Date+'"]') );
	}
	
	$(Selected).addClass('CalendarModule');
}


function Handle_Action (Selected, Event)
{
	let Item_Disabled = $(Selected).hasClass('Disabled');
	let LinkedID = $(Selected).parent('div').attr('data-connectinput');
	
	// STOP DISABLED FIELDS FROM BEING PROCESSED
	if (!Item_Disabled)
	{
		let CalendarDate = $(Selected).attr('data-date');
		let SelectedValue = $(Selected).attr('data-datevalue');
		
		// RESET PREVIOUS SELECTIONS
		$('.DateSelector > span').css('background', 'white');
		$('.SelectedOption').remove();
		$('.checked').remove();
		
		// ACTIVATE NEW SELECTION
		$(Selected).children('.WeekDay').before('<span class="SelectedOption"></span><i class="far fa-check-circle checked"></i>');
		
		// SET HIDDEN DATE INPUT FIELD VALUE
		$('input[data-inputid="'+LinkedID+'"]').attr('data-save', SelectedValue);
	}
	else
	{
		// RESET DATA SAVE FIELD
		$('input[data-inputid="'+LinkedID+'"]').attr('data-save', '');
		console.log("CALENDAR DATA SAVE NULLED");
	}
}


// FIND DATE EXCLUSION VALUES IN STRING
function Exclusion_Date_Parse (Exc)
{
	let Exclusion_Array;
	let Found_Dates = [];
	let Output_Handle = [];
	
	if (!!Exc) Exclusion_Array = Exc.split(',');
	
	// ITERATE ALL EXCLUSION VALUES IN ARRAY
	$.each(Exclusion_Array, function(Key, Exclusion)
	{
		let Integer_Value = isInteger(Exclusion);
		if (!!Integer_Value) Found_Dates.push(Exclusion);
	});
	
	function isInteger(x)
	{
		return x % 1 === 0;
	}
	
	Output_Handle.Found = !!Found_Dates.length;
	Output_Handle.Dates = Found_Dates;
	
	return Output_Handle;
}


// FIND DAY EXCLUSION VALUES IN STRING
function Exclusion_Day_Parse (Exc)
{
	let Exclusion_Array;
	let Found_Days = [];
	let Output_Handle = [];
	
	let Day_Long = [
		'Sunday',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday'
	];
	
	let Day_Short = [
		'Sun',
		'Mon',
		'Tues',
		'Wed',
		'Thurs',
		'Fri',
		'Sat'
	];
	
	
	if (!!Exc) Exclusion_Array = Exc.split(',');
	
	// ITERATE ALL EXCLUSION VALUES IN ARRAY
	$.each(Exclusion_Array, function(Key, Exclusion)
	{
		if ($.inArray(Exclusion, Day_Long) >= 0) Found_Days.push( Exclusion );
		if ($.inArray(Exclusion, Day_Short) >= 0) Found_Days.push( Exclusion );
	});
	
	Output_Handle.Found = !!Found_Days.length;
	Output_Handle.Days = Found_Days;
	
	return Output_Handle;
}


//
function Generate_Dates (Selected, Rule_Set)
{
	// GET CURRENT DATE
	let Now = new Date();
	let Timestamp_Seconds = Math.round(Now.getTime() / 1000);
	
	let Rules = Rule_Set.split(',');
	
	//
	let Dates_Amount = Rules.length;
	let Dates_Array = [];
	
	for (let i = 0; i < Dates_Amount; i+=1)
	{
		let New_Date = Day_Addition(Timestamp_Seconds*1000, i);
		let Inner_Array = [];
		let Rule;
		
		switch (Rules[i])
		{
			case "A":
			Rule = "Allow";
			break;
			
			case "E":
			Rule = "Excluded";
			break;
			
			case "W":
			Rule = "Warning";
			break;
		}
		
		Inner_Array['Date'] = New_Date;
		Inner_Array['Status'] = Rule;
		
		Dates_Array[i] = Inner_Array;
	}
	
	console.log(Dates_Array);
	return Dates_Array;
}

// INSERT ADDITIONAL DATE ROWS
function Push_Builder (Date_Selection_Array, Array_Key)
{
	let Original_Array_Length = Date_Selection_Array.length;
	let NEW_ARRAY = {};
	
	// ITERATE EACH DATE RECORD
	$.each(Date_Selection_Array, function(Key, Record)
	{		
		let Updated_Key = parseInt(Key) + 1;
		
		if (Key < Array_Key)
		{
			NEW_ARRAY[Key] = Date_Selection_Array[Key];
		}
		else if (Key == Array_Key)
		{
			let Updated_Date = Day_Addition (Date_Selection_Array[Key].Date, 1);
			
			NEW_ARRAY[Key] = Date_Selection_Array[Key];
			NEW_ARRAY[Updated_Key] = {Date: Updated_Date, Status: Date_Selection_Array[Key].Status};
			NEW_ARRAY[Key].Status = "Excluded";
		}
		else
		{
			let Updated_Date = Day_Addition (Date_Selection_Array[Key].Date, 1);
			NEW_ARRAY[Updated_Key] = {Date: Updated_Date, Status: Date_Selection_Array[Key].Status};
		}
	});
	
	return NEW_ARRAY;
}



// FORMAT FULL DATE INFORMATION
function FormatDate(D)
{
		// SET DATE VARIABLES
		
		let Days = [
			'Sunday',
			'Monday',
			'Tuesday',
			'Wednesday',
			'Thursday',
			'Friday',
			'Saturday'
		];
		
		let Days_Short = [
			'Sun',
			'Mon',
			'Tues',
			'Wed',
			'Thurs',
			'Fri',
			'Sat'
		];
		
		let Months = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December',
		];
		
		let Months_Short = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec',
		];
		
		let dateObject = new Date(D);
		let Month = dateObject.getUTCMonth() + 1;
				Month = (Month.toString().length == 1 ? '0'+Month.toString() : Month);
		let Day = (dateObject.getUTCDate().toString().length == 1 ? '0' + dateObject.getUTCDate() : dateObject.getUTCDate());
		let Year = dateObject.getUTCFullYear();
		let Hour = (dateObject.getHours().toString().length == 1 ? '0' + dateObject.getHours() : dateObject.getHours());
		let Minute = (dateObject.getMinutes().toString().length == 1 ? '0' + dateObject.getMinutes() : dateObject.getMinutes());
		let Full = Month + "/" + Day + "/" + Year;
		let AlternativeFull = Day + "/" + Month + "/" + Year;
		let Seconds = dateObject.getTime() / 1000;
		let Second = dateObject.getTime();
		let FullTime = Year + "-" + Month + "-" + Day + 'T' + Hour + ':' + Minute + ':' + '00';
		let UnixTimeStamp = dateObject.dateObject;
		
		let DayNameValue = dateObject.getDay();
		
		let DayName = Days[DayNameValue];
		let DayNameShort = Days_Short[DayNameValue];
		
		let MonthName = Months[dateObject.getUTCMonth()];
		let MonthNameShort = Months_Short[dateObject.getUTCMonth()];
		
		// BUILD DATE ARRAY
		let date = {
			'F': Full,
			'FT': FullTime,
			'AF': AlternativeFull,
			'Y': Year,
			'D': Day,
			'M': Month,
			
			'H': Hour,
			'MM': Minute,
			'S': Seconds,
			
			'UX': UnixTimeStamp,
			'WD': DayName,
			'WDS': DayNameShort,
			
			'MN': MonthName,
			'MNS': MonthNameShort,
		};
		
		return date;
	}
	

// 
function Day_Addition (Date, Days)
{
	Date = FormatDate(Date);
	
	let Days_Amount = Days * 86400;
	let NewDate_Seconds = parseInt(Date.S)+Days_Amount;
	let NewDate = FormatDate(NewDate_Seconds*1000);
	return NewDate.F;
}