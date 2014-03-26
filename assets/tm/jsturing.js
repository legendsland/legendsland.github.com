/* JavaScript Turing machine emulator */
/* Anthony Morphett - awmorp@gmail.com */
/* May 2008 */

/* Updated May 2012.  Added 'full speed' mode. */
/* Bugfix June 2012 */
/* Updated April 2013. Made states and tape symbols case-sensitive. */

/* TODO:
    * cooler head icon
    * click-to-edit tape, program
    * runtime messages shown in top area between state, steps
    * test on IE, linux browsers
    * nicer CSS
*/

var g_nDebugLevel = 0;

var bFullSpeed = false;   /* If true, run at full speed with no delay between steps */

var sTape = "0110110";
var nHeadPosition = 0;   /* the position of the TM's head on its tape. Initially zero; may be negative if TM moves to left */
var sState = "0";
var nTapeOffset = 0;     /* the logical position on TM tape of the first character of sTape */
var nSteps = 0;
var hRunTimer = null;
var aProgram = new Object();
var functions = {};


/* aProgram is a double asociative array, indexed first by state then by symbol.
   Its members are objects with properties newSymbol, action, newState and sourceLineNumber.
*/

function parse_func_call(call) {
  var c1 = call.indexOf('(');
  var c2 = call.indexOf(')');
  if( c1 === -1 || c2 === -1 || c2 <= c1 ) {
    return null;
  }

  var f = {};
  f.name = call.substr(0, c1);
  f.args = call.substr(c1+1, c2-c1-1).split(',');
  return f;
}

/* Step(): run the Turing machine for one step. Returns false if the machine is in halt state at the end of the step, true otherwise. */
function Step()
{
	if( sState == "halt" ) {
		debug( 1, "Warning: Step() called while in halt state" );
		UpdateStatusMessage( "Halted." );
		return( false );
	}
	
	var sNewState, sNewSymbol, nAction, nLineNumber;
	
	/* Find current symbol (may not be in sTape as sTape only stores modified tape cells) */
	var sHeadSymbol = GetTapeSymbol( nHeadPosition - nTapeOffset );
	if( sHeadSymbol == " " ) sHeadSymbol = "_";
	
	/* Find appropriate TM instruction */
	var oInstruction = null;

  /* function */
  if( aProgram[sState] != null && aProgram[sState]['ins'] != null ) {

    if( aProgram[sState] != null && aProgram[sState]['call'][sHeadSymbol] != null ) {
      /* Use instruction specifically corresponding to current state & symbol, if any */
      oInstruction = aProgram[sState]['call'][sHeadSymbol];
    } else if( aProgram[sState] != null && aProgram[sState]['call']["*"] != null ) {
      /* Next use rule for the current state and default symbol, if any */
      oInstruction = aProgram[sState]['call']["*"];
    } else if( aProgram[sState] != null && aProgram[sState]['call']["!"] != null &&  aProgram[sState]['call']["!"].notSymbol !== sHeadSymbol ) {
      oInstruction = aProgram[sState]['call']["!"];
    } else if( aProgram["*"] != null && aProgram["*"]['call'][sHeadSymbol] != null ) {
      /* Next use rule for default state and current symbol, if any */
      oInstruction = aProgram["*"]['call'][sHeadSymbol];
    } else if( aProgram["*"] != null && aProgram['call']["*"]["*"] != null ) {
      /* Finally use rule for default state and default symbol */
      oInstruction = aProgram['call']["*"]["*"];
    } /* else oInstruction = null; */

  } 
  else {
    if( aProgram[sState] != null && aProgram[sState][sHeadSymbol] != null ) {
      /* Use instruction specifically corresponding to current state & symbol, if any */
      oInstruction = aProgram[sState][sHeadSymbol];
    } else if( aProgram[sState] != null && aProgram[sState]["*"] != null ) {
      /* Next use rule for the current state and default symbol, if any */
      oInstruction = aProgram[sState]["*"];
    } else if( aProgram[sState] != null && aProgram[sState]["!"] != null &&  aProgram[sState]["!"].notSymbol !== sHeadSymbol ) {
      oInstruction = aProgram[sState]["!"];
    } else if( aProgram["*"] != null && aProgram["*"][sHeadSymbol] != null ) {
      /* Next use rule for default state and current symbol, if any */
      oInstruction = aProgram["*"][sHeadSymbol];
    } else if( aProgram["*"] != null && aProgram["*"]["*"] != null ) {
      /* Finally use rule for default state and default symbol */
      oInstruction = aProgram["*"]["*"];
    } /* else oInstruction = null; */
  }

	if( oInstruction != null ) {
		sNewState = (oInstruction.newState == "*" ? sState : oInstruction.newState);

		nLineNumber = oInstruction.sourceLineNumber;

    /* actions */
    for(var i=0; i<oInstruction.action.length; i++) {
      sNewSymbol = sHeadSymbol;
      nAction = (oInstruction.action[i].toLowerCase() == "r" ? 1 : (oInstruction.action[i].toLowerCase() == "l" ? -1 : 0));
      if( nAction === 0 ) {
        /* if not movements, print new symbols */
        sNewSymbol = oInstruction.action[i] == "*" ? sHeadSymbol :  oInstruction.action[i];
        SetTapeSymbol( nHeadPosition, sNewSymbol );
      }
      /* Update machine tape & state */
      //SetTapeSymbol( nHeadPosition, sNewSymbol );
      nHeadPosition += nAction;

      UpdateInterface();
    }
    
    // is function?
    // 这种函数不需要保存栈状态，一次调用覆盖上次的调用即可
    //TODO: 需要处理不带参数的函数调用，妈的
    var f = sNewState;  // 实参
    console.log(f);
    if( typeof f === 'object' // 带参数函数调用
     || ( f !== 'halt' && aProgram[f]['ins']) ) { // 不带参数的函数调用

      if( typeof f === 'string' && aProgram[f]['ins'] ) {
        f = aProgram[f]; // 重置
      }

      var func = aProgram[f.name];  // 形参

      // make arguments
      var args = {};
      for(var i=0; i<f.args.length; i++) {  // f.args  形参
        args[func.args[i]] = f.args[i];
      }
      if( func.call == null ) {
        console.log('init ' + f.name);
        func.call = {};
        $.extend(func.call, func.ins);
      }
      // 对函数里面的每条指令，进行参数替换
      _.each(func.call, function(e) {  // e 是 currentSymbol
        if ( typeof e.newState === 'object' ) {
          for(var i=0; i<e.newState.args.length; ++i) {
            // 用实参替换形参
            if( args[e.newState.args[i]] ) {
              e.newState.args[i] = args[e.newState.args[i]];
            }
          }
        } else {
            if( args[e.newState] ) {
              e.newState = args[e.newState];
            }
        }
        
      });

      // 替换输入符号
      for(var key in args) {
         if( func.call.hasOwnProperty(key) ) {
            console.log( key );
           func.call[args[key]] = func.call[key];
           delete func.call[key];
         }
      };

      sState = f.name; // 进入函数
      console.log('call: ' + f.name + ' (' + f.args + ')');

    } else {
      sState = sNewState;  // 此时 state 可能仍然是函数
    }

    //console.log('newstate: ' + sState);

  } else {
		/* No matching rule found; halt */
		debug( 1, "Warning: no instruction found for state '" + sState + "' symbol '" + sHeadSymbol + "'; halting" );
		UpdateStatusMessage( "No rule found for state '" + sState + "', symbol '" + sHeadSymbol + "'. Halted." );
		sNewState = "halt";
		sNewSymbol = sHeadSymbol;
		nAction = 0;
		nLineNumber = -1;
	}
	
	nSteps++;
	
	debug( 4, "Step() finished. New tape: '" + sTape + "'  new state: '" + sState + "'  action: " + nAction + "  line number: " + nLineNumber  );
  //SetTapeSymbol( nHeadPosition, sNewSymbol );
  //nHeadPosition += nAction;
	//UpdateInterface();
	
	if( sNewState == "halt" ) {
		if( oInstruction != null ) {
			UpdateStatusMessage( "Halted." );
		} 
		EnableButtons( false, false, false, true, true );
		return( false );
	} else return( true );
}


/* Run(): run the TM until it halts or until user interrupts it */
function Run()
{
  var bContinue = true;
  if( bFullSpeed ) {
    /* Run 25 steps at a time in fast mode */
    for( var i = 0; bContinue && i < 25; i++ ) {
      bContinue = Step();
    }
    if( bContinue ) hRunTimer = window.setTimeout( Run, 10 );
    else UpdateInterface();   /* Sometimes updates get lost at full speed... */
  } else {
    /* Run a single step every 50ms in slow mode */
    if( Step() ) {
      hRunTimer = window.setTimeout( Run, 50 );
    }
  }
}

/* RunStep(): triggered by the run timer. Calls Step(); stops running if Step() returns false. */
function RunStep()
{
	if( !Step() ) {
		StopTimer();
	}
}

/* StopTimer(): Deactivate the run timer. */
function StopTimer()
{
	if( hRunTimer != null ) {
		window.clearInterval( hRunTimer );
		hRunTimer = null;
	}
}


/* Reset( sInitialTape ): restore the TM state etc to its initial value and load the tape with sInitialTape */
function Reset( sInitialTape )
{
	if( sInitialTape == null ) sInitialTape = "";
	sTape = sInitialTape;
	nSteps = 0;
	nHeadPosition = 0;
	nTapeOffset = 0;
	sState = "0";
	
  console.log('reset');
	Compile( document.getElementById('ProgramSource').value );
	
	UpdateInterface();
}


/* GetTapeSymbol( n ): returns the symbol at cell n of the TM tape */
function GetTapeSymbol( n )
{
	if( n >= sTape.length || n < 0 ) {
		return( "_" );
	} else {
		var c = sTape.charAt( n );
		if( c == " " ) { c = "_"; debug( 4, "GetTapeSymbol() got SPACE not _ !!!" ); }
		return( c );
	}
}

/* SetTapeSymbol( n, c ): writes symbol c to cell n of the TM tape */
function SetTapeSymbol( nPos, c )
{
	var n = nPos - nTapeOffset;
	debug( 4, "SetTapeSymbol( " + nPos + ", " + c + " ); n = " + n + "; nTapeOffset = " + nTapeOffset );
	if( c == " " ) { c = "_"; debug( 4, "SetTapeSymbol() with SPACE not _ !!!" ); }
	if( n >= 0 && n < sTape.length ) {
		sTape = sTape.substr( 0, n ) + c + sTape.substr( n + 1 );
		debug( 5, "  n >= 0 && n < sTape.length; sTape = '" + sTape + "'" );
	} else if( n < 0 && c != "_" ) {
		sTape = c + repeat( "_", -1 - n ) + sTape;
		nTapeOffset += n;
		debug( 5, "  n < 0 && c != '_'; sTape = '" + sTape + "'  nTapeOffset = " + nTapeOffset );
	} else if( c != "_" ) { /* n >= sTape.length */
		sTape = sTape + repeat( "_", n - sTape.length ) + c;
		debug( 5, " c != ' ' && n >= sTape.length; sTape = '" + sTape + "'" );
	}
}

/* GetTapeLeft( n ): returns the non-blank portion of the tape to the left of cell n. Used by RenderTape(). */
function GetTapeLeft( n )
{
	/* TODO */
}

/* GetTapeRight( n ): returns the non-blank portion of the tape to the right of cell n. Used by RenderTape(). */
function GetTapeRight( n )
{
	/* TODO */
}

/* RenderTape(): show the tape contents and head position in the MachineTape div */
function RenderTape()
{
	/* Construct a DOM element displaying the tape contents and head position */
	oTmp = document.getElementById( "MachineTape" );
	/* Erase old tape */
	while( oTmp.hasChildNodes() ) {
		oTmp.removeChild( oTmp.firstChild );
	}
	
	/* calculate the strings:
	  sFirstPart is the portion of the tape to the left of the head
	  sHeadSymbol is the symbol under the head
	  sSecondPart is the portion of the tape to the right of the head
	*/
	var nTranslatedHeadPosition = nHeadPosition - nTapeOffset;  /* position of the head relative to sTape */
	var sFirstPart, sHeadSymbol, sSecondPart;
	debug( 4, "translated head pos: " + nTranslatedHeadPosition + "  head pos: " + nHeadPosition + "  tape offset: " + nTapeOffset );
	debug( 4, "sTape = '" + sTape + "'" );

	if( nTranslatedHeadPosition > 0 ) {
		sFirstPart = sTape.substr( 0, nTranslatedHeadPosition );
	} else {
		sFirstPart = "";
	}
	if( nTranslatedHeadPosition > sTape.length ) {  /* need to append blanks to sFirstPart */
		sFirstPart += repeat( " ", nTranslatedHeadPosition - sTape.length );
	}
	sFirstPart = sFirstPart.replace( /_/g, " " );
	
	if( nTranslatedHeadPosition >= 0 && nTranslatedHeadPosition < sTape.length ) {
		sHeadSymbol = sTape.charAt( nTranslatedHeadPosition );
	} else {
		sHeadSymbol = " ";
	}
	sHeadSymbol = sHeadSymbol.replace( /_/g, " " );
	
	if( nTranslatedHeadPosition >= 0 && nTranslatedHeadPosition < sTape.length - 1 ) {
		sSecondPart = sTape.substr( nTranslatedHeadPosition + 1 );
	} else if( nTranslatedHeadPosition < 0 ) {  /* need to prepend blanks to sSecondPart */
		sSecondPart = repeat( " ", -nTranslatedHeadPosition - 1 ) + sTape;
	} else {  /* nTranslatedHeadPosition > sTape.length */
		sSecondPart = "";
	}
	sSecondPart = sSecondPart.replace( /_/g, " " );
	
	debug( 4, "RenderTape(): sFirstPart = '" + sFirstPart + "' sHeadSymbol = '" + sHeadSymbol + "'  sSecondPart = '" + sSecondPart + "'" );
	
	/* add the various parts to the tape div */
	oTmp.appendChild( document.createTextNode( sFirstPart ) );
	
	var oHead = document.createElement( "span" );
	oHead.className = "TapeHeadSymbol";
	oHead.appendChild( document.createTextNode( sHeadSymbol ) );
	oTmp.appendChild( oHead );
	/* TODO: more sophisticated head icon */
	
	oTmp.appendChild( document.createTextNode( sSecondPart ) );
}

function RenderState()
{
	var oTmp = document.getElementById( "MachineState" );
	/* delete old content */
	while( oTmp.hasChildNodes() ) oTmp.removeChild( oTmp.firstChild );
	
	oTmp.appendChild( document.createTextNode( sState ) );
}

function RenderSteps()
{
	var oTmp = document.getElementById( "MachineSteps" );
	/* delete old content */
	while( oTmp.hasChildNodes() ) oTmp.removeChild( oTmp.firstChild );
	
	oTmp.appendChild( document.createTextNode( nSteps ) );
}

/* UpdateStatusMessage( sString ): display sString in the status message area */
function UpdateStatusMessage( sString )
{
	oTmp = document.getElementById( "MachineStatusMessagesContainer" );
	while( oTmp.hasChildNodes() ) oTmp.removeChild( oTmp.firstChild );
	
	oTmp.appendChild( document.createTextNode( sString ) );
}

/* UpdateInterface(): refresh the tape, state and steps displayed on the page */
function UpdateInterface()
{
	RenderTape();
	RenderState();
	RenderSteps();
}


/* Compile(): parse the inputted program and store it in aProgram */
function Compile( sSource )
{
  console.log('compile');
	debug( 5, "Compile( " + sSource + " )" );
	/* clear the old program */
	aProgram = new Object;
	
	sSource = sSource.replace( /\r/g, "" );	/* Internet Explorer uses \n\r, other browsers use \n */
	
	var aLines = sSource.split("\n");
  var is_func = false;
  var func;
	for( var i in aLines ) {
	
		var oTuple = ParseLine( aLines[i], i );
		if( oTuple != null ) {
			debug( 5, " Parsed tuple: '" + oTuple.currentState + "'  '" + oTuple.currentSymbol + "'  '" + oTuple.newSymbol + "'  '" + oTuple.action + "'  '" + oTuple.newState + "'" );

      if( oTuple.type == 'func_begin' ) {
        is_func = true;
        func = aProgram[ oTuple.args[0] ] = {}; // function object
        func.args = oTuple.args.slice(1) || []; // arguments
        func.name = oTuple.args[0];
        func.ins = {}; // function instructions, another property is 'call', generated at function call

      } else if( oTuple.type == 'func_end ') {
        is_func = false;
        console.log('function: ' + func);
        func = {};

      }else if ( oTuple.type == 'prog' ) {

        if( is_func === true ) {
          /* NOT syntax */
          if( oTuple.currentSymbol[0] === '!' ) {
            func['ins']['!'] = new Object;
            func['ins']['!'].notSymbol = oTuple.currentSymbol.charAt( 1 );
            func['ins']['!'].action = oTuple.action;
            func['ins']['!'].newState = oTuple.newState;
            func['ins']['!'].sourceLineNumber = i;
          } else {
            func['ins'][oTuple.currentSymbol] = new Object;
            func['ins'][oTuple.currentSymbol].action = oTuple.action;
            func['ins'][oTuple.currentSymbol].newState = oTuple.newState;  /* 执行的时候需要替换 */
            func['ins'][oTuple.currentSymbol].sourceLineNumber = i;
          }

        } else {
          if( aProgram[oTuple.currentState] == null ) aProgram[oTuple.currentState] = new Object;
          if( aProgram[oTuple.currentState][oTuple.currentSymbol] != null ) {
            debug( 0, "Warning: multiple definitions for state '" + oTuple.currentState + "' symbol '" + oTuple.currentSymbol + "' on lines " + aProgram[oTuple.currentState][oTuple.currentSymbol].sourceLineNumber + " and " + i );
          }
          /* NOT syntax */
          if( oTuple.currentSymbol[0] === '!' ) {
            aProgram[oTuple.currentState]['!'] = new Object;
            aProgram[oTuple.currentState]['!'].notSymbol = oTuple.currentSymbol.charAt( 1 );
            aProgram[oTuple.currentState]['!'].action = oTuple.action;
            aProgram[oTuple.currentState]['!'].newState = oTuple.newState;
            aProgram[oTuple.currentState]['!'].sourceLineNumber = i;
          } else {
            aProgram[oTuple.currentState][oTuple.currentSymbol] = new Object;
            aProgram[oTuple.currentState][oTuple.currentSymbol].action = oTuple.action;
            aProgram[oTuple.currentState][oTuple.currentSymbol].newState = oTuple.newState;
            aProgram[oTuple.currentState][oTuple.currentSymbol].sourceLineNumber = i;
          }
        }
      }
		}
	}
  console.log('compile end');
}

function ParseLine( sLine, nLineNum )
{
	/* discard anything following ';' */
	debug( 5, "ParseLine( " + sLine + " )" );
	sLine = sLine.split( ";", 1 )[0];

	/* split into tokens - separated by tab or space */
	var aTokens = sLine.split(/[ \t]+/);

	debug( 5, " aTokens.length: " + aTokens.length );
/*	for( var j in aTokens ) {
		debug( 1, "  aTokens[ " + j + " ] = '" + aTokens[j] + "'" );
	}
  if( aTokens.length > 0 && aTokens.length < 3 ) {
		return( null );
		debug( 2, "Syntax error on line " + nLineNum + "   '" + sLine + "'" );
	}
*/
	if( aTokens[0].length == 0  ) {
		return( null );
		debug( 2, "Syntax error on line " + nLineNum + "   '" + sLine + "'" );
	}
	
	/* parse tokens */
	var oTuple = new Object;

  // function definition
  if( aTokens[0] === 'function' ) {
    var name = aTokens[1];
    if( name != null ) {
      oTuple.type = 'func_begin';
      oTuple.args = [];
      for(var i=1; i<aTokens.length; i++) {
        oTuple.args[i-1] = aTokens[i];
      }
    } else {
      return null;
      debug(2, 'Syntax error');
    }
  } else if( aTokens[0] === 'end' ) {
    oTuple.type = 'func_end';
  }else {
    oTuple.type = 'prog';
    // normal instruction
    if( aTokens.length === 4 ) {
      oTuple.currentState = aTokens[0];
      oTuple.currentSymbol = aTokens[1];
      //oTuple.newSymbol = aTokens[2].charAt( 0 );
      oTuple.action = aTokens[2];
      var f = parse_func_call( aTokens[3] );
      if( f ) {
        oTuple.newState = f;
      } else {
        oTuple.newState = aTokens[3];
      }
    }
    /* in function  */
    else if( aTokens.length === 3 ) {
      oTuple.currentSymbol = aTokens[0];
      oTuple.action = aTokens[1];
      var f = parse_func_call( aTokens[2] );
      if( f ) {
        oTuple.newState = f;
      } else {
        oTuple.newState = aTokens[2];
      }
    }
  }

	return( oTuple );
}

/* return a string of n copies of c */
function repeat( c, n )
{
	var sTmp = "";
	while( n-- > 0 ) sTmp += c;
	return sTmp;
}


function debug( n, str )
{
	if( n <= 0 ) {
		UpdateStatusMessage( str );
	}
	if( g_nDebugLevel >= n  ) {
		var oDebug = document.getElementById( "debug" );
		if( oDebug ) {
			var oNode = document.createElement( 'pre' );
			oNode.appendChild( document.createTextNode( str ) );
			oDebug.appendChild( oNode );
		}
	}
}

function ClearDebug()
{
	var oDebug = document.getElementById( "debug" );
	while( oDebug.hasChildNodes() ) {
		oDebug.removeChild( oDebug.firstChild );
	}
}

function EnableButtons( bStep, bRun, bStop, bReset, bSpeed )
{
  document.getElementById( 'StepButton' ).disabled = !bStep;
  document.getElementById( 'RunButton' ).disabled = !bRun;
  document.getElementById( 'StopButton' ).disabled = !bStop;
  document.getElementById( 'ResetButton' ).disabled = !bReset;
  document.getElementById( 'SpeedCheckbox' ).disabled = !bSpeed;
}

/* Trigger functions for the buttons */

function StepButton()
{
	UpdateStatusMessage( " " );
	Step();
}

function RunButton()
{
	UpdateStatusMessage( "Running..." );
	/* Make sure that the step interval is up-to-date */
  SpeedCheckbox();
	EnableButtons( false, false, true, false, false );
	Run();
}

function StopButton()
{
	if( hRunTimer != null ) {
		UpdateStatusMessage( "Paused; click 'Run' or 'Step' to resume." );
		EnableButtons( true, true, false, true, true );
		StopTimer();
	}
}

function ResetButton()
{
	UpdateStatusMessage( "Machine reset." );
	Reset( document.getElementById( 'InitialInput' ).value );
	EnableButtons( true, true, false, true, true );
}

function SpeedCheckbox()
{
  bFullSpeed = document.getElementById( 'SpeedCheckbox' ).checked;
}

function LoadProgram( zName, bResetWhenLoaded )
{
  console.log('load begin')
	debug( 1, "Load '" + zName + "'" );
	var zFileName = zName + ".txt";
	var oRequest = new XMLHttpRequest();
	oRequest.onreadystatechange = function()
	{
		if( oRequest.readyState == 4 ) {
			document.getElementById( "ProgramSource" ).value = oRequest.responseText;
			Compile( document.getElementById('ProgramSource').value );
			
			/* Load the default initial tape, if any */
			var oRegExp = new RegExp( ";.*\\$INITIAL_TAPE:? *(.+)$");
			var aResult = oRegExp.exec( oRequest.responseText );
			debug( 2, "Regexp matched: '" + aResult + "' length: " + (aResult == null ? "null" : aResult.length) );
			if( aResult != null && aResult.length >= 2 ) {
				document.getElementById( "InitialInput" ).value = aResult[1];
			}
			
			/* Reset the machine to load the new tape, etc, if required */
			/* This is necessary only when loading the default program for the first time */
			if( bResetWhenLoaded ) {
				Reset( document.getElementById( 'InitialInput' ).value );
			}
		}
	};
	
	oRequest.open( "GET", zFileName, true );
	oRequest.send( null );
  console.log('load end')
}

function x()
{
  /* For debugging */
}
