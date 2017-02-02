-- =============================================
-- Author:		Mark Entingh
-- Create date: 2/11/2013 6:45 PM
-- Description:	
-- =============================================
CREATE PROCEDURE LogError 
	@datecreated datetime = '', 
	@errorNumber int = 0,
	@userId int = 0,
	@message nvarchar(MAX) = '',
	@stackTrace nvarchar(MAX) = ''
AS
BEGIN
	SET NOCOUNT ON;
	INSERT INTO ErrorLog (datecreated, userId, errornumber, [message], stackTrace) 
	VALUES(@datecreated, @userId, @errorNumber, @message, @stackTrace)
END
