let input = document.querySelector("input");
let terminalBody = document.querySelector("#terminalBody");

let commandList = ['Bio', 'clear', 'echo', 'Github', 'name', 'projects', 'resume', 'socials', 'chess-game', 'dino-game', 'ivasive-no-button - not working yet'];

functionCalls();

function functionCalls() {
    checkWindowClick();
    checkPressedEnter();
}

function checkWindowClick() {
    terminalBody.addEventListener ('click', function(event){
        input.focus();
    });
}

function checkPressedEnter() {
    input.addEventListener('keydown', function(e){
        if (e.key === 'Enter') {
            execute(input.value);
        }
    });
}

function execute(inputValue) {
    let temp = input.value;
    input.remove();
    terminalBody.innerHTML += temp;
    checkCommand(temp);
    addInput();
}

function executeCommand(command){

    // terminalBody.innerHTML += '<br>'

    for(let i=0; i<data[command].length; ++i){

        terminalBody.innerHTML += `${data[command][i].name}: ` ;

        if(data[command][i].value.includes('http')){
            terminalBody.innerHTML += `<a href="${data[command][i].value}" target="_blank">${data[command][i].value}</a><br>` ;
        } else{
            terminalBody.innerHTML += `${data[command][i].value}<br>` ;
        }
    }
}

function checkCommand(inputCommand){

    let command = inputCommand.split(" ")[0];

    if(command){
        if(command === 'clear'){ commandClear();}
        else if(command === 'echo') {commandEcho(inputCommand);}
        else if(command === 'Github'){ commandGithub(command)}
        else if(command === 'help'){ commandHelp();}
        else if(command === 'resume'){ commandResume();}
        else if(command === 'chess-game'){ executeChessGame();}
        else if(command === 'dino-game'){ commandDinoGame();} // Added new command check
        else if(command === 'ivasive-no-button'){ commandIvasiveButton();} // Added new command check
        else if(commandList.includes(command)){ executeCommand(command);}
        else{
            terminalBody.innerHTML +=  '<br>' + inputCommand + ' is not recognized as a command, Try \"help\"<br>';
        }
    }
    else {
        terminalBody.innerHTML += '<br>';
    }
}
//hello

function addInput() {
    terminalBody.innerHTML += ' > <input type="text" autofocus />';
    input = document.querySelector("input");
    input.focus();
    functionCalls();
}

function commandClear() {
    terminalBody.innerHTML = ``;
}

function commandHelp() {
    terminalBody.innerHTML += '<br><br>';
    for(let i=0; i<commandList.length; i++) {
        terminalBody.innerHTML += `${commandList[i]}<br>`
    }
}

function commandGithub() {
    terminalBody.innerHTML += `<br><i class="fa fa-github"> <a href="https://github.com/${data.github[0].value}" target="_blank">${data.github[0].value}</a><br>`;
    terminalBody.innerHTML += '<br>';
}

function commandResume() {
    terminalBody.innerHTML += `<br><a href=assets/${data.resume}>Resume</a><br>`;
}

function commandEcho(inputCommand) {
    terminalBody.innerHTML += '<br>';
    for(let i=1; i<inputCommand.split(' ').length; i++){
        terminalBody.innerHTML += inputCommand.split(' ')[i] + ' ';
    }
    terminalBody.innerHTML += '<br>';
}

// New function to handle the redirection
function commandIvasiveButton() {
    // terminalBody.innerHTML += '<br>Redirecting to new page...<br>';
    // setTimeout(function() {
    //     window.location.href = 'new_page.html';
    // }, 1000);
    terminalBody.innerHTML += '<br>';
}
// uncomment this function to enable the new page redirection

function commandDinoGame() {
    terminalBody.innerHTML += '<br>Redirecting to new page...<br>';
    setTimeout(function() {
        window.location.href = 'dino-game.html';
    }, 1000);

}

function executeChessGame() {
    terminalBody.innerHTML += '<br>Redirecting to chess game...<br>';
    setTimeout(function() {
        window.location.href = 'chess-game.html';
    }, 1000);
}