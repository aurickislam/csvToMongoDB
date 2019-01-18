let validationRules;

$(function () {
	console.log("Aurick");

	$.ajax({
		type: 'GET',
		url: "/validationRules/getValidationRules",
		timeout: 10000,
		success: function (response, status, xhr) {
			console.log("@response", response);
			console.log("@status", status);
			console.log("@xhr", xhr);
			// $.notify("Saved successfully", "success");
			validationRules = response;
		},
		error: function () {
			console.log("failed");
			$.notify("Failed to save", "error");
		}
	});

	$('.upload').click(function (e) {
		// console.log(this);

		let file = document.getElementById('csvFile').files[0];

		let fileReader = new FileReader();
		fileReader.onload = function (event) {

			let data = {
				fileBuffer: fileReader.result,
				fileName: file.name
			};

			$.ajax({
				type: 'POST',
				url: "/csvUpload/upload",
				data: JSON.stringify(data),
				cache: false,
				contentType: 'application/json',
				processData: false,
				timeout: 10000,
				success: function (response, status, xhr) {
					console.log("@response", response);
					console.log("@status", status);
					console.log("@xhr", xhr);
				},
				error: function () {
					console.log("failed");
					$.notify("Failed to save", "error");
				}
			});
		};
		fileReader.readAsText(file);

		/*validateFile((result) => {
			console.log("validateFile", result);
			if (!result)
				$.notify("This file is invalid", "error");
		});*/
	});
});

function validateFile(fn) {
	console.log('@validateFile');

	let _validFileExtensions = [".csv"],
		file = document.getElementById('csvFile').files[0], //assuming you have only 1 file
		isValidType = false;

	console.log(file);

	if (!file) {
		console.log("Select a file");

		// $('.audienceFileName').html('Upload file');
		showError("Select a file", true);
		if (typeof fn == 'function')
			fn(false);
		return
	} else {
		showError("", false);
	}

	for (let j = 0; j < _validFileExtensions.length; j++) {
		let sCurExtension = _validFileExtensions[j];
		if (file.name.substr(file.name.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
			isValidType = true;
			break;
		}
	}

	if (!isValidType) {
		console.log("Sorry, " + file.name + " is invalid, allowed extensions are: " + _validFileExtensions.join(", "), true);
		showError("Sorry, " + file.name + " is invalid, allowed extensions are: " + _validFileExtensions.join(", "), true);
		if (typeof fn == 'function')
			fn(false);
		return;
	} else {
		// $(".audienceFileName").html(file.name);
		showError("", false);
	}

	let fileReader = new FileReader();
	fileReader.onload = function (event) {
		if (!_.isEmpty(fileReader.result)) {
			try {
				let rawHeader = fileReader.result.match(/.*?(?=\r|\n)/)[0],
					headerList = rawHeader.split(','), isValidHeader = true;

				console.log("@headerList", headerList);

				for (let i = 0; i < validationRules.length; i++) {
					let column = validationRules[i];
					if (headerList.indexOf(column) == -1) {
						isValidHeader = false;
						break;
					}
				}

				if (!isValidHeader) {
					console.log("invalid header");
					showError("This file's header doesn't match with defined header", true);
					if (typeof fn == 'function')
						fn(false);
				} else {
					console.log("valid header");
					showError("", false);
					if (typeof fn == 'function')
						fn(true);
				}
			} catch (e) {
				showError("File is empty", true);
				if (typeof fn == 'function')
					fn(false);
			}
		} else {
			showError("File is empty", true);
			if (typeof fn == 'function')
				fn(false);
		}
	};

	fileReader.readAsText(file);
}

function showError(message, action) {
	console.log('@showError');
	$(".audienceFileWarning").html(message);
	// $('#uploadAudience').prop('disabled', action);
	// $('#uploadAudienceCreateSegment').prop('disabled', action);
}