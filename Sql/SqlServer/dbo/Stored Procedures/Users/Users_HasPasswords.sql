CREATE PROCEDURE [dbo].[Users_HasPasswords]
AS
	IF (SELECT COUNT(*) FROM Users WHERE userId=1) = 0 BEGIN
		SELECT 1;
	END 
	ELSE IF (SELECT COUNT(*) FROM Users WHERE [password] = '' AND userId=1) > 0 BEGIN
		SELECT 1;
	END 
	ELSE IF (SELECT COUNT(*) FROM Users WHERE [password] = '' AND userId>1) > 0 BEGIN
		SELECT 2;
	END 
	ELSE BEGIN
		SELECT 0;
	END
