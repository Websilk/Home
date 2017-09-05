CREATE PROCEDURE [dbo].[Users_HasPasswords]
AS
	IF (SELECT COUNT(*) FROM Users WHERE [password] = '' AND userId=1) > 0 BEGIN
		SELECT 1;
	END
	IF (SELECT COUNT(*) FROM Users WHERE [password] = '' AND userId>1) > 0 BEGIN
		SELECT 2;
	END
	SELECT 0;
