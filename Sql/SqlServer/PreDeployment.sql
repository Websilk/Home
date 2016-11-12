DECLARE @restart bit = 1
IF @restart = 1 BEGIN
	/* Clear initial data (if you so desire) */
	DELETE FROM components
	DELETE FROM errorlog
	DELETE FROM [log]
	DELETE FROM loganalytics
	DELETE FROM [login]
	DELETE FROM pagelayers
	DELETE FROM pages
	DELETE FROM passwordreset
	DELETE FROM timeline
	DELETE FROM users
	DELETE FROM websites
	DELETE FROM websitedomains
	DELETE FROM websitesubdomains
	DELETE FROM websitesecurity

	ALTER SEQUENCE SequencePages
	RESTART

	ALTER SEQUENCE SequencePhotoFolders
	RESTART
	
	ALTER SEQUENCE SequenceUsers
	RESTART

	ALTER SEQUENCE SequenceWebsites
	RESTART
END

