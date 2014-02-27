String.prototype.Humanize = function() {
	return this.replace(/([A-Z])/g, ' $1');
};