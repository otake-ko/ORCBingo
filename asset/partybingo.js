(function(){
	var pingoNumber = $('#pingo-number');
	var startButton = $('#start-button');
	var resetButton = $('#reset-button');
	var historiesDiv = $('#histories');
	var drumAudio = $('#drum').get(0);
	var customNumberInput = $('#custom-number');
	var addNumberButton = $('#add-number-button');
	var undoButton = $('#undo-button');
	var redoButton = $('#redo-button');
	var redoStack = [];
	
	// init histories
	var toBingoString = function(n){
		if(n > 9) {
			return n.toString(10);
		} else if (n < 0) {	
			return '00';
		} else {
			return '0' +  n.toString(10);
		}
	};
	var addHistory = function(n) {
		if (!historiesDiv.find('.history-number').filter(function() { return $(this).text() === toBingoString(n); }).length) {
			historiesDiv.append('<div class="col-md-1"><p class="history-number">' + toBingoString(n) + '</p></div>');
		}
	};
	
	// init number list and storage
	var numberListAll = [];
	var maxNumber = 110;
	for(var num = 1; num <= maxNumber; num++) {
		numberListAll.push(num);
	}

	var storage = localStorage;
	var listKey = 'partybingo.numberlist';
	var removedKey = 'partybingo.removedlist';
	var setNumberList = function(a) {
		storage.setItem(listKey, JSON.stringify(a));
	};
	var getNumberList = function() {
		return JSON.parse(storage.getItem(listKey));
	};
	var setRemovedList = function(a) {
		storage.setItem(removedKey, JSON.stringify(a));
	};
	var getRemovedList = function() {
		return JSON.parse(storage.getItem(removedKey));
	};
	var resetLists = function() {
		setNumberList(numberListAll.concat());
		setRemovedList([]);
	};
	
	// create initial list or loadHistory
	var loadedNumberList = getNumberList();
	var loadedRemovedList = getRemovedList();
	if(loadedNumberList && loadedRemovedList) {
		for (var i = 0; i < loadedRemovedList.length; i++) {
			addHistory(loadedRemovedList[i]);
		}
	} else {
		resetLists();
	} 

	// create util method
	var getNumberRamdom = function(){
		var numberList = getNumberList();
		var i = Math.floor(Math.random() * numberList.length);
		return numberList[i];
	};
	var removeNumberRamdom = function(){
		var numberList = getNumberList();
		if(numberList.length === 0) {
			return -1;
		}
		var i = Math.floor(Math.random() * numberList.length);
		var removed = numberList[i];
		numberList.splice(i, 1);
		setNumberList(numberList);
		var removedList = getRemovedList();
		removedList.push(removed);
		setRemovedList(removedList);
		return removed;
	};
	
	// init start button
	var isStarted = false;
	function rourletto() {
		if(isStarted) {
			pingoNumber.text(toBingoString(getNumberRamdom()));
			setTimeout(rourletto, 60);
		}
	} 
	var stop = function(time) {
		isStarted = false;
		startButton.text('Start');
		var n = removeNumberRamdom();
		pingoNumber.text(toBingoString(n));
		addHistory(n);
		drumAudio.pause();
	};
	var start = function(){
		isStarted = true;
		startButton.text('Stop');
		drumAudio.currentTime = 0; 
		drumAudio.play();
		rourletto();
	};
	var startClicked = function(e){
		if(isStarted) {
			stop(null);
		} else {
			start();
		}
	};
	startButton.click(startClicked); // button
	startButton.focus();
	
	// init reset button
	var resetClicked = function() {
		if (confirm('本当にリセットしますか？')) {
			resetLists();
			pingoNumber.text('00');
			historiesDiv.empty();
			drumAudio.pause();
			startButton.focus();
		}
	};
	resetButton.click(resetClicked);

	var addCustomNumber = function() {
		var customNumber = parseInt(customNumberInput.val(), 10);
		if (isNaN(customNumber) || customNumber < 1 || customNumber > maxNumber) {
			alert('1~110の数値を入力してください');
			return;
		}
		var numberList = getNumberList();
		var removedList = getRemovedList();
		if (removedList.includes(customNumber)) {
			alert('既に出た数字です');
			return;
		}
		if (!numberList.includes(customNumber)) {
			numberList.push(customNumber);
			setNumberList(numberList);
		}
		addHistory(customNumber);
		customNumberInput.val('');
	};

	addNumberButton.click(addCustomNumber);

	var undoLastAction = function() {
		if (confirm('本当に元に戻しますか？')) {
			var removedList = getRemovedList();
			if (removedList.length === 0) {
				alert('取り消す動作がありません');
				return;
			}
			var lastRemoved = removedList.pop();
			redoStack.push(lastRemoved);
			setRemovedList(removedList);

			var numberList = getNumberList();
			numberList.push(lastRemoved);
			setNumberList(numberList);

			historiesDiv.find('.history-number').last().parent().remove();
			pingoNumber.text(toBingoString(lastRemoved));
		}
	};

	var redoLastAction = function() {
		if (redoStack.length === 0) {
			alert('やり直す動作がありません');
			return;
		}
		var lastRedo = redoStack.pop();
		var numberList = getNumberList();
		var removedList = getRemovedList();

		numberList.splice(numberList.indexOf(lastRedo), 1);
		removedList.push(lastRedo);

		setNumberList(numberList);
		setRemovedList(removedList);

		addHistory(lastRedo);
		pingoNumber.text(toBingoString(lastRedo));
	};

	undoButton.click(undoLastAction);
	redoButton.click(redoLastAction);
	
})();