﻿CREATE PROCEDURE [dbo].[HasPassword]
	@userId int = 0
AS
	SELECT COUNT(*) FROM Users WHERE userId=@userId AND NOT [password] = '' AND [password] IS NOT NULL
