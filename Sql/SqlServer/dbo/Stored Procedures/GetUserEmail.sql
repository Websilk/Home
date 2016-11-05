CREATE PROCEDURE [dbo].[GetUserEmail]
	@userId int = 0
AS
	SELECT email FROM Users WHERE userId=@userId
