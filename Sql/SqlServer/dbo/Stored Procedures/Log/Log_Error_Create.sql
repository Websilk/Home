-- =============================================
-- Author:		Mark Entingh
-- Create date: 2/11/2013 6:45 PM
-- Description:	
-- =============================================
CREATE PROCEDURE Log_Error_Create 
	@dateCreated datetime = '', 
	@errorNumber int = 0,
	@userId int = 0,
	@message nvarchar(MAX) = '',
	@stackTrace nvarchar(MAX) = ''
AS
BEGIN
	SET NOCOUNT ON;
	INSERT INTO ErrorLog (dateCreated, userId, errorNumber, [message], stackTrace) 
	VALUES(@dateCreated, @userId, @errorNumber, @message, @stackTrace)
END
