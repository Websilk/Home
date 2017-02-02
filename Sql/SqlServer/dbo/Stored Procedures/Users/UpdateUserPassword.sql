CREATE PROCEDURE [dbo].[UpdateUserPassword]
	@userId int = 0,
	@password nvarchar(100) = ''
AS
	UPDATE Users SET [password]=@password WHERE userId=@userId