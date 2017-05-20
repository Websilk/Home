CREATE PROCEDURE [dbo].[User_UpdatePassword]
	@userId int = 0,
	@password nvarchar(100) = ''
AS
	UPDATE Users SET [password]=@password WHERE userId=@userId