

-- =============================================
-- Author:		Mark Entingh
-- Create date: 10/13/2011 11:33 AM
-- Description:	Adds a user to the platform
-- =============================================
CREATE PROCEDURE [dbo].[User_Create] 
	@email nvarchar(75) = '',
	@password nvarchar(100) = '',
	@displayname nvarchar(25) = '',
	@photo nvarchar(30) = '',
	@status int = 0,
	@signupip nvarchar(15) = '',
	@referrer nvarchar(250) = '',
	@activation nchar(20) = '',
	@deleted bit = 0
AS
BEGIN
	SET NOCOUNT ON;
	DECLARE @date datetime = GETDATE(),
	@id int = NEXT VALUE FOR SequenceUsers

    INSERT INTO Users (userId, email, [password], displayname, photo,
    lastlogin, datecreated, [status],
    signupip, referrer, [activation], deleted)
    VALUES
    (@id, @email, @password, @displayname, @photo,
	@date, @date, @status,
    @signupip, @referrer, @activation, @deleted)
    
    SELECT @id
END
