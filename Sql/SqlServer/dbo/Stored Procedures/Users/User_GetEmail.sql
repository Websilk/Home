CREATE PROCEDURE [dbo].[User_GetEmail]
	@userId int = 0
AS
	SELECT email FROM Users WHERE userId=@userId
