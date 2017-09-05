CREATE PROCEDURE [dbo].[User_UpdateEmail]
	@userId int = 0,
	@email nvarchar(75),
	@password nvarchar(100) = ''
AS
	UPDATE Users SET email=@email, [password]=@password WHERE userId=@userId
